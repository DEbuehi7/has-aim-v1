export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAura8Session } from "@/lib/aura8/auth";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAura8Session();
    if (!session.verified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: content, error: getError } = await supabase
      .from("aura8_content")
      .select("id, views")
      .eq("id", id)
      .single();

    if (getError || !content) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const nextViews = (content.views ?? 0) + 1;

    const { error: updateError } = await supabase
      .from("aura8_content")
      .update({ views: nextViews, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, views: nextViews });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
