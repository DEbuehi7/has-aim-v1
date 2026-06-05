export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { contact_id, status, notes, next_call_at } = await req.json();

    if (!contact_id) {
      return NextResponse.json({ error: "contact_id required" }, { status: 400 });
    }

    const { data: current } = await supabase
      .from("has_contacts")
      .select("call_attempts")
      .eq("id", contact_id)
      .single();

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      last_called_at: new Date().toISOString(),
      call_attempts: (current?.call_attempts ?? 0) + 1,
    };

    if (status) updates.status = status;
    if (notes) updates.notes = notes;
    if (next_call_at) updates.next_call_at = next_call_at;

    const { data, error } = await supabase
      .from("has_contacts")
      .update(updates)
      .eq("id", contact_id)
      .select()
      .single();

    if (error) throw new Error(JSON.stringify(error));

    return NextResponse.json({ success: true, contact: data });

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
