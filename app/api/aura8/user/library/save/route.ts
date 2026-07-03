export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAura8Session } from "@/lib/aura8/auth";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
  try {
    const session = await getAura8Session();
    if (!session.verified || !session.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const contentId = body?.contentId;
    const status = typeof body?.status === "string" ? body.status : "saved";

    if (!contentId || typeof contentId !== "string") {
      return NextResponse.json({ error: "contentId is required" }, { status: 400 });
    }

    const payload = {
      user_email: session.email,
      content_id: contentId,
      status,
      saved_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("aura8_user_library")
      .upsert(payload, { onConflict: "user_email,content_id" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
