export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const limit = body.limit ?? 50;

    const bdRes = await fetch("https://api.batchdata.com/api/v1/property/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.BATCHDATA_API_TOKEN,
      },
      body: JSON.stringify({ filters: { state: "CA", city: "Los Angeles" }, limit }),
    });

    const rawText = await bdRes.text();
    let bdJson;
    try { bdJson = JSON.parse(rawText); } catch (e) {
      return NextResponse.json({ error: "Parse error", raw: rawText.substring(0, 300) }, { status: 500 });
    }

    const results = bdJson.results ?? bdJson.data ?? [];
    if (results.length === 0) {
      return NextResponse.json({ success: false, keys: Object.keys(bdJson), sample: rawText.substring(0, 300) }, { status: 404 });
    }

    let inserted = 0;
    let skipped = 0;
    for (const r of results) {
      const fullAddress = r?.address?.fullAddress ?? r?.address?.street ?? null;
      const ownerName = r?.owner?.fullName ?? null;
      const mailingAddress = r?.owner?.mailingAddress?.street ?? null;
      if (fullAddress === null) { skipped++; continue; }
      const { error } = await supabase.from("has_contacts").upsert({
        full_name: ownerName,
        mailing_address: mailingAddress,
        notes: fullAddress,
        source: "BATCHDATA_SEARCH",
        status: "NEW",
        skip_traced: false,
        dnc: false,
        do_not_call: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: "notes" });
      if (error) { skipped++; } else { inserted++; }
    }

    return NextResponse.json({ success: true, results_returned: results.length, inserted, skipped });

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
