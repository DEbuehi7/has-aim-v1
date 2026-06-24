export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    // Look up the token
    const { data: tokenRow, error: tokenError } = await supabase
      .from("aura8_email_tokens")
      .select("*")
      .eq("token", token)
      .single();

    if (tokenError || !tokenRow) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    // Check expiry
    if (new Date(tokenRow.expires_at) < new Date()) {
      await supabase.from("aura8_email_tokens").delete().eq("token", token);
      return NextResponse.json({ error: "Token has expired. Please request a new verification email." }, { status: 400 });
    }

    const email = tokenRow.email;

    // Mark subscriber as age_verified
    await supabase
      .from("aura8_subscribers")
      .upsert([{ email, age_verified: true }], { onConflict: "email" });

    // Delete used token
    await supabase.from("aura8_email_tokens").delete().eq("token", token);

    // Set HTTP-only cookie (1 year)
    const cookieStore = await cookies();
    cookieStore.set("aura8_verified", "true", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    return NextResponse.json({ success: true, email });
  } catch (e) {
    console.error("email-verify error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
