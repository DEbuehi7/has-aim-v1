import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { createComplianceSessionToken, getClientIpAddress, isComplianceIpAllowed } from "@/lib/aura8/compliance-session";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "Missing username or password" }),
        { status: 400 }
      );
    }

    const clientIp = getClientIpAddress(request);

    // Check IP whitelist
    if (!isComplianceIpAllowed(clientIp)) {
      return new Response(
        JSON.stringify({ error: "IP address not allowed" }),
        { status: 403 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Query compliance account
    const { data: complianceAccount, error } = await supabase
      .from("compliance_accounts")
      .select("*")
      .eq("username", username)
      .eq("active", true)
      .maybeSingle();

    if (error || !complianceAccount) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401 }
      );
    }

    // Check expiry
    if (
      complianceAccount.expires_at &&
      new Date() > new Date(complianceAccount.expires_at)
    ) {
      return new Response(
        JSON.stringify({ error: "Account expired" }),
        { status: 403 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(
      password,
      complianceAccount.password_hash
    );

    if (!passwordMatch) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401 }
      );
    }

    const userAgent = request.headers.get("user-agent") || "unknown";

    // Log access
    await supabase.from("compliance_audit_log").insert({
      compliance_account_id: complianceAccount.id,
      action: "login",
      ip_address: clientIp,
      user_agent: userAgent,
    });

    // Create session token
    const sessionToken = createComplianceSessionToken(complianceAccount.id);

    // Return session + permissions
    return new Response(
      JSON.stringify({
        session_token: sessionToken,
        account_type: complianceAccount.account_type,
        role: complianceAccount.role,
        permissions: complianceAccount.permissions,
        organization: complianceAccount.organization,
        last_login_at: complianceAccount.last_login_at,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Compliance login error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
