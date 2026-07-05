/**
 * GET /api/aura8/companion/tokens
 *
 * Returns the authenticated user's token balance, tier, and daily usage.
 * Reads email from the aura8_email httpOnly cookie (set at email verification).
 *
 * Response:
 *   200 { balance, tier, dailyUsed, dailyLimit, canSend }
 *   401 if not email-verified
 *   500 on unexpected error
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getTokenBalance } from "@/lib/aura8/tokens";

export async function GET() {
  try {
    // ── Auth: read httpOnly cookies set by email-verify route ────────────────
    const cookieStore = await cookies();
    const verified    = cookieStore.get("aura8_verified")?.value === "true";
    const email       = cookieStore.get("aura8_email")?.value ?? null;

    if (!verified || !email) {
      return NextResponse.json(
        { error: "Email verification required" },
        { status: 401 }
      );
    }

    // ── Read token balance ────────────────────────────────────────────────────
    const balance = await getTokenBalance(email);

    return NextResponse.json({
      ok: true,
      email,
      balance:    balance.balance,
      tier:       balance.tier,
      dailyUsed:  balance.dailyUsed,
      dailyLimit: balance.dailyLimit,
      canSend:    balance.canSend,
    });
  } catch (err) {
    console.error("[companion/tokens] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
