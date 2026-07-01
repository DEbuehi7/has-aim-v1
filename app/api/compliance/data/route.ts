import { createClient } from "@supabase/supabase-js";
import { verifyComplianceSessionToken, getClientIpAddress } from "@/lib/aura8/compliance-session";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("x-compliance-token");

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    // Verify token
    const session = verifyComplianceSessionToken(token);
    if (!session) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Verify compliance account is still active
    const { data: complianceAccount, error: accountError } = await supabase
      .from("compliance_accounts")
      .select("id, active, expires_at")
      .eq("id", session.sub)
      .maybeSingle();

    if (accountError || !complianceAccount?.active) {
      return new Response(
        JSON.stringify({ error: "Account inactive" }),
        { status: 403 }
      );
    }

    if (
      complianceAccount.expires_at &&
      new Date() > new Date(complianceAccount.expires_at)
    ) {
      return new Response(
        JSON.stringify({ error: "Account expired" }),
        { status: 403 }
      );
    }

    // Fetch all compliance-relevant data
    const [yotiResult, ccbillResult, subscribersResult, auditLogResult] =
      await Promise.all([
        supabase
          .from("yoti_verifications")
          .select("*")
          .order("verified_at", { ascending: false }),
        supabase
          .from("ccbill_webhook_events")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("aura8_subscribers")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("compliance_audit_log")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

    const clientIp = getClientIpAddress(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Log dashboard access
    await supabase.from("compliance_audit_log").insert({
      compliance_account_id: session.sub,
      action: "view_dashboard",
      resource_type: "dashboard",
      ip_address: clientIp,
      user_agent: userAgent,
      details: { view: "all_compliance_data" },
    });

    return new Response(
      JSON.stringify({
        yoti_verifications: yotiResult.data || [],
        ccbill_webhook_events: ccbillResult.data || [],
        subscribers: subscribersResult.data || [],
        audit_log: auditLogResult.data || [],
        exported_at: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Compliance data error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
