export const dynamic = "force-dynamic";
export const preload = false;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAura8Session } from "@/lib/aura8/auth";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error("Missing Supabase credentials");
  }
  
  return createClient(url, key);
}

function sanitizeSearchTerm(value: string) {
  return value.replace(/[,%()]/g, " ").replace(/\s+/g, " ").trim();
}

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseClient();
    const session = await getAura8Session();
    if (!session.verified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = sanitizeSearchTerm(searchParams.get("search") || "");
    const categories = (searchParams.get("categories") || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 12), 1), 30);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from("aura8_content").select("*", { count: "exact" });

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (categories.length) {
      query = query.in("category", categories);
    }

    if (sort === "most_viewed") {
      query = query.order("views", { ascending: false }).order("created_at", { ascending: false });
    } else if (sort === "trending") {
      query = query.order("views", { ascending: false }).order("updated_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = count ?? 0;
    return NextResponse.json({
      items: data ?? [],
      page,
      limit,
      total,
      hasMore: from + (data?.length ?? 0) < total,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
