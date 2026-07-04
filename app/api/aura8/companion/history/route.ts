/**
 * GET /api/aura8/companion/history
 *
 * Returns the last 50 conversation messages for the authenticated user.
 * Reads from the aura8_conversations Supabase table.
 *
 * If the table doesn't exist yet (before migration), returns an empty array
 * rather than a 500 — graceful degradation.
 *
 * Run scripts/create-companion-tables.sql to create aura8_conversations.
 *
 * Response:
 *   200 { messages: Message[] }
 *   401 if not email-verified
 *   500 on unexpected error
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminClient } from "@/lib/supabase/admin";

export interface ConversationRow {
  id:          string;
  created_at:  string;
  email:       string;
  role:        "user" | "assistant";
  content:     string;
  tokens_used: number;
}

export async function GET() {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const cookieStore = await cookies();
    const verified    = cookieStore.get("aura8_verified")?.value === "true";
    const email       = cookieStore.get("aura8_email")?.value ?? null;

    if (!verified || !email) {
      return NextResponse.json({ error: "Email verification required" }, { status: 401 });
    }

    // ── Query conversation history ────────────────────────────────────────────
    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from("aura8_conversations")
      .select("id, created_at, email, role, content, tokens_used")
      .eq("email", email.toLowerCase().trim())
      .order("created_at", { ascending: true })
      .limit(50);

    // Graceful degradation: table may not exist before migration
    if (error) {
      const isTableMissing =
        error.message.includes("does not exist") ||
        error.message.includes("relation") ||
        error.code === "42P01";

      if (isTableMissing) {
        console.warn("[companion/history] aura8_conversations table not found — returning empty");
        return NextResponse.json({ ok: true, messages: [] });
      }

      console.error("[companion/history] Query error:", error.message);
      return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, messages: data ?? [] });
  } catch (err) {
    console.error("[companion/history] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
