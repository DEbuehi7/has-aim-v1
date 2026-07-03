export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { getAdminClient } from "@/lib/supabase/admin";

type DatabaseCheck = {
  status: "ok" | "error" | "skipped";
  checkedAt: string;
  target: string;
  message?: string;
};

const DATABASE_CHECK_TARGET = "aura8_subscribers";

async function checkDatabaseConnection(): Promise<DatabaseCheck> {
  const checkedAt = new Date().toISOString();

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return {
      status: "skipped",
      checkedAt,
      target: DATABASE_CHECK_TARGET,
      message:
        "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    };
  }

  try {
    const supabase = getAdminClient();
    const { error } = await supabase
      .from(DATABASE_CHECK_TARGET)
      .select("id", { head: true, count: "exact" });

    if (error) {
      throw error;
    }

    return {
      status: "ok",
      checkedAt,
      target: DATABASE_CHECK_TARGET,
    };
  } catch (error) {
    return {
      status: "error",
      checkedAt,
      target: DATABASE_CHECK_TARGET,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

const startupDatabaseCheckPromise = checkDatabaseConnection();

export async function GET() {
  const [startupDatabaseCheck, runtimeDatabaseCheck] = await Promise.all([
    startupDatabaseCheckPromise,
    checkDatabaseConnection(),
  ]);

  return NextResponse.json(
    {
      status: "ok",
      service: "has-aim-v1",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      routes: {
        login: "/login",
        webhook: "/api/ccbill/webhook",
        admin: "/admin/ccbill",
      },
      database: {
        startup: startupDatabaseCheck,
        runtime: runtimeDatabaseCheck,
      },
    },
    { status: 200 }
  );
}
