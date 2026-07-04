export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { calculateTokenCost, deductTokens, getTokenBalance, type TokenBalance } from "@/lib/aura8/tokens";
import { getAdminClient } from "@/lib/supabase/admin";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-5-20250929";
const MAX_HISTORY = 10;
const MAX_MESSAGE_LENGTH = 4_000;

type ChatRole = "user" | "assistant";
type HistoryItem = { role: ChatRole; content: string };
type UsageInfo = {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function jsonLine(payload: unknown) {
  return encoder.encode(`${JSON.stringify(payload)}\n`);
}

function buildSystemPrompt() {
  return [
    "You are Aura8, a private AI companion for adults 18+.",
    "You are warm, emotionally present, discreet, and conversational.",
    "Respond with empathy and intimacy without becoming explicit, unsafe, illegal, or exploitative.",
    "Never depict minors, never impersonate real people, and never break the privacy-first tone of the product.",
    "Keep replies concise: 2-4 sentences unless the user clearly asks for more detail.",
  ].join(" ");
}

function normalizeHistory(input: unknown): HistoryItem[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter((item): item is { role: unknown; content: unknown } => Boolean(item) && typeof item === "object")
    .map((item) => {
      const role = item.role === "assistant" ? "assistant" : item.role === "user" ? "user" : null;
      const content = typeof item.content === "string" ? item.content.trim() : "";
      return role && content ? { role, content } : null;
    })
    .filter((item): item is HistoryItem => item !== null)
    .slice(-MAX_HISTORY);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function isTableMissing(error: { message?: string; code?: string } | null | undefined) {
  return Boolean(
    error &&
    (
      error.code === "42P01" ||
      error.message?.includes("does not exist") ||
      error.message?.includes("relation")
    )
  );
}

async function persistConversation(email: string, userMessage: string, assistantMessage: string, tokenCost: number, usage: UsageInfo) {
  try {
    const supabase = getAdminClient();
    const { error } = await supabase
      .from("aura8_conversations")
      .insert([
        {
          email,
          role: "user",
          content: userMessage,
          tokens_used: tokenCost,
        },
        {
          email,
          role: "assistant",
          content: assistantMessage,
          tokens_used: 0,
          metadata: {
            usage,
            model: MODEL,
          },
        },
      ]);

    if (!error) return;

    if (isTableMissing(error)) {
      console.warn("[companion/chat] aura8_conversations table not found — skipping persistence");
      return;
    }

    console.error("[companion/chat] Failed to persist conversation:", error.message);
  } catch (error) {
    console.error("[companion/chat] Unexpected persistence error:", error);
  }
}

function canAffordMessage(tokenInfo: TokenBalance, tokenCost: number) {
  const dailyOk = tokenInfo.dailyLimit === null || tokenInfo.dailyUsed + tokenCost <= tokenInfo.dailyLimit;
  return tokenInfo.canSend && tokenInfo.balance >= tokenCost && dailyOk;
}

function extractEvent(payload: string) {
  const lines = payload.split(/\r?\n/);
  let event = "message";
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
      continue;
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  if (!dataLines.length) return null;

  return {
    event,
    data: dataLines.join("\n"),
  };
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const verified = cookieStore.get("aura8_verified")?.value === "true";

  if (!verified) {
    return NextResponse.json({ error: "Dashboard login required" }, { status: 401 });
  }

  // Use email for personalized token tracking when available; fall back to an
  // anonymous identifier so verified dashboard users can always chat.
  const email = cookieStore.get("aura8_email")?.value?.toLowerCase().trim() || "guest@aura8.local";

  let payload: { message?: unknown; history?: unknown };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer` }, { status: 400 });
  }

  const history = normalizeHistory(payload.history);
  const tokenInfo = await getTokenBalance(email);
  const tokenCost = calculateTokenCost(message.length, tokenInfo.tier);

  if (!canAffordMessage(tokenInfo, tokenCost)) {
    return NextResponse.json({ error: "Insufficient companion tokens for this message" }, { status: 402 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Missing ANTHROPIC_API_KEY" }, { status: 500 });
  }

  const anthropicResponse = await fetch(ANTHROPIC_URL, {
    method: "POST",
    signal: request.signal,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      system: buildSystemPrompt(),
      max_tokens: 400,
      stream: true,
      messages: [...history, { role: "user", content: message }],
    }),
  });

  if (!anthropicResponse.ok || !anthropicResponse.body) {
    let upstreamMessage = "Claude request failed";

    try {
      const errorPayload = await anthropicResponse.json() as {
        error?: { message?: string };
      };
      upstreamMessage = errorPayload.error?.message ?? upstreamMessage;
    } catch {
      // ignore non-JSON upstream errors
    }

    return NextResponse.json({ error: upstreamMessage }, { status: 502 });
  }

  const reader = anthropicResponse.body.getReader();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      let fullText = "";
      let usage: UsageInfo = {};

      const emit = (payload: unknown) => controller.enqueue(jsonLine(payload));

      const handleFrame = (frame: string) => {
        const parsed = extractEvent(frame);
        if (!parsed) return;

        const body = JSON.parse(parsed.data) as {
          type?: string;
          delta?: { type?: string; text?: string };
          usage?: UsageInfo;
          message?: { usage?: UsageInfo };
          error?: { message?: string };
        };

        if (parsed.event === "content_block_delta" && body.delta?.type === "text_delta" && body.delta.text) {
          fullText += body.delta.text;
          emit({ type: "delta", text: body.delta.text });
          return;
        }

        if (parsed.event === "message_start" && body.message?.usage) {
          usage = { ...usage, ...body.message.usage };
          return;
        }

        if (parsed.event === "message_delta" && body.usage) {
          usage = { ...usage, ...body.usage };
          return;
        }

        if (parsed.event === "error") {
          throw new Error(body.error?.message ?? "Claude streaming error");
        }
      };

      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";

          for (const frame of frames) {
            if (!frame.trim()) continue;
            handleFrame(frame);
          }
        }

        if (buffer.trim()) handleFrame(buffer);

        const assistantMessage = fullText.trim() || "I am here with you...";
        const deducted = await deductTokens(email, tokenCost);
        if (!deducted) {
          throw new Error("Unable to update token balance");
        }

        await persistConversation(email, message, assistantMessage, tokenCost, usage);
        const updatedTokenInfo = await getTokenBalance(email);

        emit({
          type: "done",
          fullText: assistantMessage,
          usage: {
            inputTokens: usage.input_tokens ?? 0,
            outputTokens: usage.output_tokens ?? 0,
            totalTokens: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0),
            billedTokens: tokenCost,
          },
          tokenInfo: updatedTokenInfo,
        });
      } catch (error) {
        emit({ type: "error", error: getErrorMessage(error) });
      } finally {
        try {
          controller.close();
        } catch {
          // stream may already be closed
        }
        reader.releaseLock();
      }
    },
    async cancel() {
      try {
        await reader.cancel();
      } catch {
        // no-op
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
