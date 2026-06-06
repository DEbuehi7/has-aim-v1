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
    const zip = body.zip ?? "90011";
    const quickList = body.quickList ?? "absentee-owner";
    const take = body.take ?? 25;

    const bdRes = await fetch("https://api.batchdata.com/api/v1/property/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.BATCHDATA_API_TOKEN,
      },
      body: JSON.stringify({
        searchCriteria: {
          query: zip + ", CA",
          quickList: quickList,
        },
        options: { take },
      }),
    });

    const bdJson = await bdRes.json();
    const properties = bdJson?.results?.properties ?? [];

    if (properties.length === 0) {
      return NextResponse.json({ success: false, message: "No properties found", meta: bdJson?.results?.meta }, { status: 404 });
    }

    let inserted = 0;
    let skipped = 0;

    for (const r of properties) {
      const fullAddress = r?.address?.fullAddress ?? r?.address?.street ?? null;
      const ownerName = r?.owner?.fullName ?? null;
      const mailingAddress = r?.owner?.mailingAddress?.street ?? null;
      const taxDefault = r?.quickLists?.taxDefault ?? false;
      const absenteeOwner = r?.quickLists?.absenteeOwner ?? false;

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

    return NextResponse.json({
      success: true,
      properties_found: bdJson?.results?.meta?.resultsFound,
      results_returned: properties.length,
      inserted,
      skipped,
      zip,
      quickList,
    });

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
