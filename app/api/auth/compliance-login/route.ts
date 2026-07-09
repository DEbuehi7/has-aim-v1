export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  createComplianceSessionToken,
  getClientIpAddress,
  getComplianceSessionDurationMs,
  isComplianceIpAllowed,
} from "@/lib/aura8/compliance-session";

type ComplianceAccountRow = {
  id: string;
  username: string;
  password_hash: string;
  account_type: string | null;
  role: string | null;
  organization: string | null;
  permissions: string[] | null;
  restrictions: string[] | null;
  active: boolean | null;
  expires_at: string | null;
};

async function writeAuditLog(details: {
  complianceAccountId: string | null;
  action: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = getAdminClient();

  await supabase.from("compliance_audit_log").insert({
    compliance_account_id: details.complianceAccountId,
    action: details.action,
    resource_type: "authentication",
    ip_address: details.ipAddress,
    user_agent: details.userAgent,
    details: details.metadata ?? {},
  });
}

export async function POST(request: Request) {
  try {
    const { username, password } = (await request.json()) as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const normalizedUsername = username.trim().toLowerCase();
    const ipAddress = getClientIpAddress(request);
    const userAgent = request.headers.get("user-agent") ?? "unknown";

    if (!isComplianceIpAllowed(ipAddress)) {
      await writeAuditLog({
        complianceAccountId: null,
        action: "login_blocked_ip",
        ipAddress,
        userAgent,
        metadata: { username: normalizedUsername },
      });

      return NextResponse.json(
        { error: "Access denied for this IP address" },
        { status: 403 }
      );
    }

    const supabase = getAdminClient();
    const { data: complianceAccount, error: accountError } = await supabase
      .from("compliance_accounts")
      .select(
        "id, username, password_hash, account_type, role, organization, permissions, restrictions, active, expires_at"
      )
      .eq("username", normalizedUsername)
      .maybeSingle<ComplianceAccountRow>();

    if (accountError) {
      return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }

    if (!complianceAccount) {
      await writeAuditLog({
        complianceAccountId: null,
        action: "login_failed",
        ipAddress,
        userAgent,
        metadata: { username: normalizedUsername, reason: "account_not_found" },
      });

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!complianceAccount.active) {
      await writeAuditLog({
        complianceAccountId: complianceAccount.id,
        action: "login_blocked_inactive",
        ipAddress,
        userAgent,
      });

      return NextResponse.json({ error: "Account inactive" }, { status: 403 });
    }

    if (
      complianceAccount.expires_at &&
      new Date(complianceAccount.expires_at).getTime() <= Date.now()
    ) {
      await writeAuditLog({
        complianceAccountId: complianceAccount.id,
        action: "login_blocked_expired",
        ipAddress,
        userAgent,
      });

      return NextResponse.json({ error: "Account expired" }, { status: 403 });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      complianceAccount.password_hash
    );

    if (!isPasswordMatch) {
      await writeAuditLog({
        complianceAccountId: complianceAccount.id,
        action: "login_failed",
        ipAddress,
        userAgent,
        metadata: { reason: "invalid_password" },
      });

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const nowIso = new Date().toISOString();
    await supabase
      .from("compliance_accounts")
      .update({
        last_login_at: nowIso,
        last_login_ip: ipAddress,
      })
      .eq("id", complianceAccount.id);

    await writeAuditLog({
      complianceAccountId: complianceAccount.id,
      action: "login_success",
      ipAddress,
      userAgent,
      metadata: { organization: complianceAccount.organization },
    });

    const sessionToken = createComplianceSessionToken(complianceAccount.id);
    const expiresAt = new Date(
      Date.now() + getComplianceSessionDurationMs()
    ).toISOString();

    return NextResponse.json(
      {
        session_token: sessionToken,
        expires_at: expiresAt,
        account_type: complianceAccount.account_type,
        role: complianceAccount.role,
        organization: complianceAccount.organization,
        permissions: complianceAccount.permissions ?? [],
        restrictions: complianceAccount.restrictions ?? [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[auth/compliance-login] Unexpected error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
