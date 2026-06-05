export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("has_contacts")
      .select("id, full_name, mailing_address, phone_primary, phone_secondary, call_attempts, status, next_call_at, notes, dnc, skip_traced")
      .order("next_call_at", { ascending: true, nullsFirst: false });

    if (error) throw new Error(JSON.stringify(error));

    return NextResponse.json({ success: true, contacts: data });

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
