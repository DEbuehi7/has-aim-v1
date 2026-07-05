export const dynamic = "force-dynamic";
export const preload = false;

import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error("Missing Supabase credentials");
  }
  
  return createClient(url, key);
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("has_contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);

  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = getSupabaseClient();
    const body = await req.json();

    const { data, error } = await supabase
      .from("has_contacts")
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);

  } catch (e) {
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const supabase = getSupabaseClient();
    const body = await req.json();

    const { id, ...updates } = body;

    const { data, error } = await supabase
      .from("has_contacts")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);

  } catch (e) {
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}
