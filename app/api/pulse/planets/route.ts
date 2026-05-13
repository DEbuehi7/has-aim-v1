export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    const { data: planets, error: pe } = await supabase
      .from("aimedia_planets")
      .select("*")
      .order("id", { ascending: true });

    if (pe) throw pe;

    const { data: characters, error: ce } = await supabase
      .from("aimedia_characters")
      .select("*")
      .order("id", { ascending: true });

    if (ce) throw ce;

    return NextResponse.json({ planets, characters });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch planets", detail: String(e) }, { status: 500 });
  }
}
