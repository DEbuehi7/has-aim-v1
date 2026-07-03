export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAura8Session } from "@/lib/aura8/auth";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAura8Session();
    if (!session.verified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: item, error } = await supabase.from("aura8_content").select("*").eq("id", id).single();

    if (error || !item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: categoryRelated } = await supabase
      .from("aura8_content")
      .select("*")
      .neq("id", id)
      .eq("category", item.category)
      .order("views", { ascending: false })
      .limit(6);

    let related = categoryRelated ?? [];

    if (related.length < 4 && Array.isArray(item.tags) && item.tags.length) {
      const { data: tagRelated } = await supabase
        .from("aura8_content")
        .select("*")
        .neq("id", id)
        .overlaps("tags", item.tags)
        .order("views", { ascending: false })
        .limit(6);

      if (tagRelated?.length) {
        const seen = new Set(related.map((entry) => entry.id));
        for (const candidate of tagRelated) {
          if (!seen.has(candidate.id) && related.length < 6) {
            related.push(candidate);
            seen.add(candidate.id);
          }
        }
      }
    }

    return NextResponse.json({ item, related });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
