export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("aura8_waitlist")
      .insert([{ email, source: "aura8.fun", created_at: new Date().toISOString() }]);

    if (error && !error.message.includes("duplicate")) throw error;

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to join waitlist", detail: String(e) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("aura8_waitlist")
      .select("id, email, source, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ count: data.length, subscribers: data });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch waitlist" }, { status: 500 });
  }
}
