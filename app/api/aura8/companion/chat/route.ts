/**
 * POST /api/aura8/companion/chat
 *
 * Authenticated streaming chat endpoint.
 *
 * Flow:
 *   1. Auth: read aura8_verified + aura8_email cookies
 *   2. Parse { message, history? } from request body
 *   3. Check token balance — reject if canSend === false
 *   4. Stream Claude response back to client (newline-delimited JSON)
 *   5. After stream closes: deduct tokens, save both turns to aura8_conversations
 *
 * Stream format (one JSON object per line):
 *   {"type":"delta","text":"Hello"}
 *   {"type":"done","fullText":"Hello world"}
 *   {"type":"error","error":"..."}
 *
 * Response codes:
 *   200  — streaming response
 *   400  — missing message
 *   401  — not email-verified
 *   402  — insufficient tokens
 *   500  — unexpected error
 */

export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminClient } from "@/lib/supabase/admin";
import { streamClaudeResponse, type ConversationMessage } from "@/lib/aura8/companion";
import { getTokenBalance, calculateTokenCost, deductTokens, getTier } from "@/lib/aura8/tokens";

// ---------------------------------------------------------------------------
// Save messages to DB (best-effort, after stream completes)
// ---------------------------------------------------------------------------

async function saveMessages(
  email:         string,
  userMessage:   string,
  assistantText: string,
  tokensUsed:    number
): Promise<void> {
  try {
    const supabase = getAdminClient();
    const now      = new Date().toISOString();

    await supabase.from("aura8_conversations").insert([
      { email, role: "user",      content: userMessage,   tokens_used: tokensUsed, created_at: now },
      { email, role: "assistant", content: assistantText, tokens_used: 0,          created_at: now },
    ]);
  } catch (err) {
    // Non-fatal — table may not exist yet
    console.warn("[companion/chat] saveMessages failed:", err);
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const verified    = cookieStore.get("aura8_verified")?.value === "true";
  const email       = cookieStore.get("aura8_email")?.value ?? null;

  if (!verified || !email) {
    return NextResponse.json({ error: "Email verification required" }, { status: 401 });
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: { message?: string; history?: ConversationMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const history: ConversationMessage[] = Array.isArray(body.history) ? body.history : [];

  // ── Token check ────────────────────────────────────────────────────────────
  const balanceInfo = await getTokenBalance(email);
  if (!balanceInfo.canSend) {
    return NextResponse.json(
      {
        error: balanceInfo.dailyLimit !== null && balanceInfo.dailyUsed >= balanceInfo.dailyLimit
          ? "Daily message limit reached. Upgrade your plan for more."
          : "Insufficient tokens. Upgrade your plan to continue.",
        balance: balanceInfo.balance,
        tier:    balanceInfo.tier,
      },
      { status: 402 }
    );
  }

  const tier      = getTier(balanceInfo.tier);
  const tokenCost = calculateTokenCost(message.length, tier);

  // ── Stream Claude response ─────────────────────────────────────────────────
  // We intercept the stream to capture fullText for DB persistence,
  // then pipe it through to the client transparently.
  const encoder  = new TextEncoder();
  let fullText   = "";
  let streamDone = false;

  const claudeStream = streamClaudeResponse(message, history);
  const reader        = claudeStream.getReader();

  const passthrough = new ReadableStream<Uint8Array>({
    async start(controller) {
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Parse the chunk to capture fullText for saving
          const text = decoder.decode(value, { stream: true });
          for (const line of text.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const parsed = JSON.parse(trimmed) as { type: string; fullText?: string };
              if (parsed.type === "done" && parsed.fullText) {
                fullText   = parsed.fullText;
                streamDone = true;
              }
            } catch { /* non-JSON line — ignore */ }
          }

          controller.enqueue(value);
        }
        controller.close();
      } catch (err) {
        console.error("[companion/chat] passthrough error:", err);
        controller.close();
      } finally {
        // Deduct tokens and save to DB once the stream is fully consumed
        if (streamDone && fullText) {
          await Promise.all([
            deductTokens(email, tokenCost),
            saveMessages(email, message, fullText, tokenCost),
          ]);
        }
      }
    },
  });

  return new Response(passthrough, {
    status: 200,
    headers: {
      "Content-Type":  "text/plain; charset=utf-8",
      "X-Token-Cost":  String(tokenCost),
      "X-Token-Tier":  balanceInfo.tier,
      "Cache-Control": "no-store",
    },
  });
}
