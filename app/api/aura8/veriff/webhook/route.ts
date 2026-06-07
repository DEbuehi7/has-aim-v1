export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hmac-signature");

    const expectedSig = crypto
      .createHmac("sha256", process.env.VERIFF_API_SECRET)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSig) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const sessionId = payload?.data?.verification?.id;
    const decision = payload?.data?.verification?.status;
    const code = payload?.data?.verification?.code;

    if (!sessionId) {
      return NextResponse.json({ error: "No session ID in webhook" }, { status: 400 });
    }

    await supabase
      .from("aura8_veriff_sessions")
      .update({
        status: decision ?? "unknown",
        decision: JSON.stringify(payload?.data),
        decided_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId);

    if (code === 9001) {
      await supabase
        .from("aura8_veriff_sessions")
        .update({ status: "approved" })
        .eq("session_id", sessionId);
    }

    return NextResponse.json({ success: true, session_id: sessionId, decision });

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
