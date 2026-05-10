// ============================================================

// FILE 9A -- app/api/deals/route.ts

// ============================================================



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

.from("has_deals")

.select("*")

.order("updated_at", { ascending: false });

if (error) throw error;

return NextResponse.json(data);

} catch (e) {

return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 });

}

}



export async function POST(req) {

try {

const body = await req.json();

const { data, error } = await supabase

.from("has_deals")

.insert([body])

.select()

.single();

if (error) throw error;

return NextResponse.json(data);

} catch (e) {

return NextResponse.json({ error: "Failed to create deal" }, { status: 500 });

}

}



export async function PATCH(req) {

try {

const body = await req.json();

const { id, ...updates } = body;

const { data, error } = await supabase

.from("has_deals")

.update({ ...updates, updated_at: new Date().toISOString() })

.eq("id", id)

.select()

.single();

if (error) throw error;

return NextResponse.json(data);

} catch (e) {

return NextResponse.json({ error: "Failed to update deal" }, { status: 500 });

}

}
