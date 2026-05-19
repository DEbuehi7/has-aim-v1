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
      .from("aim_compliance")
      .select("*, aim_properties(address)")
      .order("due_date", { ascending: true });

    if (error) throw error;

    const alerts = data.map(item => ({
      id: item.id,
      alert_type: item.deadline_type,
      address: item.aim_properties?.address ?? "General",
      message: item.notes ?? item.deadline_type,
      lead_score: null,
      read: item.submission_status === "SUBMITTED",
      created_at: item.created_at,
      due_date: item.due_date,
      jurisdiction: item.jurisdiction,
      responsible_party: item.responsible_party,
      submission_status: item.submission_status,
    }));

    return NextResponse.json(alerts);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch alerts", detail: String(e) }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();

    if (body.markAllRead) {
      const { error } = await supabase
        .from("aim_compliance")
        .update({ submission_status: "SUBMITTED" })
        .eq("submission_status", "PENDING");
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    const { id, ...updates } = body;
    const { data, error } = await supabase
      .from("aim_compliance")
      .update({ submission_status: updates.read ? "SUBMITTED" : "PENDING" })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Failed to update alert", detail: String(e) }, { status: 500 });
  }
}
