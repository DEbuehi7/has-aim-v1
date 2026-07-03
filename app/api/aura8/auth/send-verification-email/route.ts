export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiryMinutes = parseInt(process.env.EMAIL_VERIFICATION_TOKEN_EXPIRY_MINUTES ?? "10", 10);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();

    // Delete any existing tokens for this email
    await supabase
      .from("aura8_email_tokens")
      .delete()
      .eq("email", normalizedEmail);

    // Insert new token
    const { error: insertError } = await supabase
      .from("aura8_email_tokens")
      .insert([{ email: normalizedEmail, token, expires_at: expiresAt }]);

    if (insertError) {
      console.error("Token insert error:", insertError);
      return NextResponse.json({ error: "Failed to create verification token" }, { status: 500 });
    }

    // Upsert subscriber record
    await supabase
      .from("aura8_subscribers")
      .upsert([{ email: normalizedEmail, age_verified: false }], { onConflict: "email", ignoreDuplicates: true });

    // HARDCODED: Always use has-aim-v1.vercel.app (production deployment)
    const verifyUrl = `https://has-aim-v1.vercel.app/aura8/verify?token=${token}`;
    
    // DEBUG: Log what we're sending
    console.log("📧 SENDING EMAIL TO:", normalizedEmail);
    console.log("🔗 VERIFICATION URL:", verifyUrl);
    console.log("⏰ EXPIRY:", expiryMinutes, "minutes");

    // Send email via SendGrid
    const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: normalizedEmail }] }],
        from: { email: "noreply@aura8.fun", name: "Aura8" },
        subject: "Verify your email — Aura8",
        content: [
          {
            type: "text/html",
            value: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#060608;color:#E8E8F0;font-family:monospace;padding:40px 24px;margin:0;">
  <div style="max-width:480px;margin:0 auto;background:#0D0D0F;border:1px solid #FF006E40;border-radius:8px;padding:40px;">
    <div style="font-size:10px;color:#FF006E;letter-spacing:0.2em;margin-bottom:16px;">AURA8 — EMAIL VERIFICATION</div>
    <h1 style="font-size:20px;font-weight:800;color:#FFF;margin:0 0 16px;">Confirm your email</h1>
    <p style="font-size:13px;color:#9A9A9F;line-height:1.8;margin:0 0 8px;">
      Click the button below to verify your email address and access Aura8.
      This link expires in ${expiryMinutes} minutes.
    </p>
    <p style="font-size:11px;color:#71717A;line-height:1.7;margin:0 0 28px;">
      <strong style="color:#FF006E;">Disclosure:</strong> This site contains AI-generated adult content intended for users 18 years of age or older.
    </p>
    <a href="${verifyUrl}" style="display:block;background:#FF006E;border-radius:6px;padding:14px 24px;color:#FFF;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:0.08em;text-align:center;margin-bottom:24px;">
      VERIFY MY EMAIL
    </a>
    <p style="font-size:11px;color:#52525B;margin:0 0 8px;">
      Or copy and paste this link into your browser:
    </p>
    <p style="font-size:10px;color:#3F3F46;word-break:break-all;margin:0 0 24px;">${verifyUrl}</p>
    <p style="font-size:10px;color:#3F3F46;margin:0;">
      If you did not request this, you can safely ignore this email.
      Aura8 — Smiling Bubbles Inc. — Adults 18+ only.
    </p>
  </div>
</body>
</html>
            `.trim(),
          },
        ],
      }),
    });

    if (!sgRes.ok) {
      const sgErr = await sgRes.text();
      console.error("SendGrid error:", sgErr);
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 502 });
    }

    console.log("✅ EMAIL SENT SUCCESSFULLY");
    return NextResponse.json({ success: true, message: "Verification email sent" });
  } catch (e) {
    console.error("send-verification-email error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
