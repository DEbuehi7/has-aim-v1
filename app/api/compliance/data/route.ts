export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  getClientIpAddress,
  isComplianceIpAllowed,
  verifyComplianceSessionToken,
} from "@/lib/aura8/compliance-session";

type ComplianceAccountRow = {
  id: string;
  username: string;
  organization: string | null;
  permissions: string[] | null;
  active: boolean | null;
  expires_at: string | null;
};

export async function GET(request: Request) {
  try {
    const token = request.headers.get("x-compliance-token");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = verifyComplianceSessionToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ipAddress = getClientIpAddress(request);
    const userAgent = request.headers.get("user-agent") ?? "unknown";

    if (!isComplianceIpAllowed(ipAddress)) {
      return NextResponse.json(
        { error: "Access denied for this IP address" },
        { status: 403 }
      );
    }

    const supabase = getAdminClient();
    const { data: complianceAccount, error: accountError } = await supabase
      .from("compliance_accounts")
      .select("id, username, organization, permissions, active, expires_at")
      .eq("id", session.sub)
      .maybeSingle<ComplianceAccountRow>();

    if (accountError || !complianceAccount) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!complianceAccount.active) {
      return NextResponse.json({ error: "Account inactive" }, { status: 403 });
    }

    if (
      complianceAccount.expires_at &&
      new Date(complianceAccount.expires_at).getTime() <= Date.now()
    ) {
      return NextResponse.json({ error: "Account expired" }, { status: 403 });
    }

    const [
      yotiVerificationsResult,
      ccbillWebhookEventsResult,
      aura8SubscribersResult,
      complianceAuditLogResult,
    ] = await Promise.all([
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
        .order("updated_at", { ascending: false }),
      supabase
        .from("compliance_audit_log")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    const errors = [
      yotiVerificationsResult.error?.message,
      ccbillWebhookEventsResult.error?.message,
      aura8SubscribersResult.error?.message,
      complianceAuditLogResult.error?.message,
    ].filter(Boolean);

    if (errors.length) {
      return NextResponse.json(
        {
          error: "Failed to fetch compliance data",
          details: errors,
        },
        { status: 500 }
      );
    }

    await supabase.from("compliance_audit_log").insert({
      compliance_account_id: complianceAccount.id,
      action: "view_compliance_dashboard",
      resource_type: "compliance_dashboard",
      ip_address: ipAddress,
      user_agent: userAgent,
      details: {
        yoti_verifications_count: yotiVerificationsResult.data?.length ?? 0,
        ccbill_webhook_events_count: ccbillWebhookEventsResult.data?.length ?? 0,
        aura8_subscribers_count: aura8SubscribersResult.data?.length ?? 0,
        compliance_audit_log_count: complianceAuditLogResult.data?.length ?? 0,
      },
    });

    return NextResponse.json(
      {
        account: {
          username: complianceAccount.username,
          organization: complianceAccount.organization,
          permissions: complianceAccount.permissions ?? [],
        },
        yoti_verifications: yotiVerificationsResult.data ?? [],
        ccbill_webhook_events: ccbillWebhookEventsResult.data ?? [],
        aura8_subscribers: aura8SubscribersResult.data ?? [],
        compliance_audit_log: complianceAuditLogResult.data ?? [],
        exported_at: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[api/compliance/data] Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to fetch compliance data" },
      { status: 500 }
    );
  }
}
