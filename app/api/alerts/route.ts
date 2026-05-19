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

.select("*")

.order("created_at", { ascending: false })

.limit(100);

if (error) throw error;

return NextResponse.json(data);

} catch (e) {

return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });

}

}



export async function PATCH(req) {

try {

const body = await req.json();




if (body.markAllRead) {

  const { error } = await supabase

    .from("aim_compliance")

    .update({ read: true })

    .eq("read", false);

  if (error) throw error;

  return NextResponse.json({ success: true });

}



const { id, ...updates } = body;

const { data, error } = await supabase

  .from("aim_compliance")

  .update(updates)

  .eq("id", id)

  .select()

  .single();

if (error) throw error;

return NextResponse.json(data);




} catch (e) {

return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });

}

}
