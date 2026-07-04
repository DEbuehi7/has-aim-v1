/**
 * lib/aura8/tokens.ts
 *
 * Token economy for the Aura8 AI Companion feature.
 *
 * Tier system (aura8_subscribers.plan):
 *   lite     — 5 tokens/message, max 50 tokens/day (10 messages)
 *   pro      — 1 token per 100 chars, no daily cap
 *   premium  — 0 tokens (free), no daily cap
 *
 * Balance stored in aura8_subscribers.metadata.tokens (integer).
 * Daily counter: metadata.tokens_today + metadata.tokens_reset_date (YYYY-MM-DD).
 *
 * Never import this in client components.
 */

import { getAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SubscriberTier = "lite" | "pro" | "premium" | "unknown";

export interface TokenBalance {
  balance: number;
  tier: SubscriberTier;
  dailyUsed: number;
  dailyLimit: number | null; // null = unlimited
  canSend: boolean;
}

// ---------------------------------------------------------------------------
// getTier
// ---------------------------------------------------------------------------

/** Map aura8_subscribers.plan → canonical SubscriberTier. */
export function getTier(plan: string | null | undefined): SubscriberTier {
  if (!plan) return "lite";
  const p = plan.toLowerCase();
  if (p.includes("premium") || p.includes("solace8")) return "premium";
  if (p.includes("pro")) return "pro";
  return "lite";
}

// ---------------------------------------------------------------------------
// calculateTokenCost
// ---------------------------------------------------------------------------

/**
 * Token cost for one message exchange.
 * @param messageLength  Character count of the user message
 * @param tier           Subscriber tier
 */
export function calculateTokenCost(
  messageLength: number,
  tier: SubscriberTier
): number {
  if (tier === "premium") return 0;
  if (tier === "pro")     return Math.max(1, Math.ceil(messageLength / 100));
  return 5; // lite: flat 5 tokens per message
}

// ---------------------------------------------------------------------------
// getTokenBalance
// ---------------------------------------------------------------------------

/** Read token balance + daily usage for a subscriber email. */
export async function getTokenBalance(email: string): Promise<TokenBalance> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("aura8_subscribers")
    .select("plan, metadata")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (error) console.error("[tokens] getTokenBalance:", error.message);

  const tier  = getTier(data?.plan);
  const meta  = (data?.metadata as Record<string, unknown>) ?? {};
  const today = new Date().toISOString().slice(0, 10);

  const resetDate = typeof meta.tokens_reset_date === "string" ? meta.tokens_reset_date : null;
  const dailyUsed = resetDate === today && typeof meta.tokens_today === "number"
    ? (meta.tokens_today as number) : 0;

  const defaultBal = tier === "premium" ? 999_999 : tier === "pro" ? 500 : 50;
  const balance    = typeof meta.tokens === "number" ? (meta.tokens as number) : defaultBal;
  const dailyLimit = tier === "lite" ? 50 : null;
  const canSend    = balance > 0 && (dailyLimit === null || dailyUsed < dailyLimit);

  return { balance, tier, dailyUsed, dailyLimit, canSend };
}

// ---------------------------------------------------------------------------
// deductTokens
// ---------------------------------------------------------------------------

/**
 * Deduct `amount` tokens from the subscriber's balance.
 * Returns true on success, false if balance is insufficient or a DB error occurs.
 * Never throws.
 */
export async function deductTokens(email: string, amount: number): Promise<boolean> {
  if (amount <= 0) return true; // premium tier — nothing to deduct

  const supabase = getAdminClient();
  const norm     = email.toLowerCase().trim();

  const { data, error: readErr } = await supabase
    .from("aura8_subscribers")
    .select("plan, metadata")
    .eq("email", norm)
    .maybeSingle();

  if (readErr) { console.error("[tokens] deductTokens read:", readErr.message); return false; }

  const tier       = getTier(data?.plan);
  const meta       = (data?.metadata as Record<string, unknown>) ?? {};
  const defaultBal = tier === "pro" ? 500 : 50;
  const current    = typeof meta.tokens === "number" ? (meta.tokens as number) : defaultBal;

  if (current < amount) return false; // insufficient balance

  const today     = new Date().toISOString().slice(0, 10);
  const resetDate = typeof meta.tokens_reset_date === "string" ? meta.tokens_reset_date : null;
  const dayUsed   = resetDate === today && typeof meta.tokens_today === "number"
    ? (meta.tokens_today as number) : 0;

  const { error: updateErr } = await supabase
    .from("aura8_subscribers")
    .update({
      metadata: {
        ...meta,
        tokens:              current - amount,
        tokens_today:        dayUsed + amount,
        tokens_reset_date:   today,
        tokens_last_deducted: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq("email", norm);

  if (updateErr) { console.error("[tokens] deductTokens update:", updateErr.message); return false; }
  return true;
}

