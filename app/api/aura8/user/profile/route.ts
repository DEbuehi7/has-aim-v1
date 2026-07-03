export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const verified = cookieStore.get("aura8_verified")?.value === "true";
    const email = cookieStore.get("aura8_email")?.value;

    if (!verified || !email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("aura8_subscribers")
      .select("email, age_verified, created_at, preferences")
      .eq("email", email)
      .single();

    if (error || !data) {
      return NextResponse.json({ email, age_verified: true, preferences: {} });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("profile GET error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const verified = cookieStore.get("aura8_verified")?.value === "true";
    const email = cookieStore.get("aura8_email")?.value;

    if (!verified || !email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { preferences } = body;

    const { error } = await supabase
      .from("aura8_subscribers")
      .update({ preferences, updated_at: new Date().toISOString() })
      .eq("email", email);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("profile POST error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
