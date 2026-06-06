export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SELA_ZIPS = ["90001","90002","90003","90011","90037","90044","90059","90061"];

export async function POST(req) {
  try {
    const body = await req.json();
    const zips = body.zips ?? SELA_ZIPS;
    const limit = body.limit ?? 50;

    const bdRes = await fetch("https://api.batchdata.com/api/v1/property/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.BATCHDATA_API_TOKEN,
      },
      body: JSON.stringify({
        filters: {
          state: "CA",
          city: "Los Angeles",
        },
        limit,
      }),
    });

    const rawText = await bdRes.text();
    let bdJson;
    try { bdJson = JSON.parse(rawText); } catch (e) {
      return NextResponse.json({ error: "Parse error", raw: rawText.substring(0, 500) }, { status: 500 });
    }

    const results = bdJson?.results ?? bdJson?.result?.data ?? bdJson?.data ?? [];

    if (!results.length) {
      return NextResponse.json({
        success: false,
        message: "No results",
        keys: Object.keys(bdJson),
        sample: JSON.stringify(bdJson).substring(0, 300),
      }, { status: 404 });
    }

    let inserted = 0;
    let skipped = 0;

    for (const r of results) {
      const address = r?.address?.street ?? r?.street ?? null;
      const fullAddress = r?.address?.fullAddress ?? address;
      const ownerName = r?.owner?.fullName ?? null;
      const mailingAddress = r?.owner?.mailingAddress?.street ?? null;
      const taxDelinquent = r?.quickLists?.taxDefault ?? false;
      const absenteeOwner = r?.quickLists?.absenteeOwner ?? false;

      if (!fullAddress) { skipped++; continue; }

      const { error } = await supabase
        .from("has_contacts")
        .upsert({
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
      results_returned: results.length,
      inserted,
      skipped,
    });

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}    }

    const results = bdJson?.results ?? bdJson?.result?.data ?? bdJson?.data ?? [];

    if (!results.length) {
      return NextResponse.json({
        success: false,
        message: "No results",
        keys: Object.keys(bdJson),
        sample: JSON.stringify(bdJson).substring(0, 300),
      }, { status: 404 });
    }

    let inserted = 0;
    let skipped = 0;

    for (const r of results) {
      const address = r?.address?.street ?? r?.street ?? null;
      const fullAddress = r?.address?.fullAddress ?? address;
      const ownerName = r?.owner?.fullName ?? null;
      const mailingAddress = r?.owner?.mailingAddress?.street ?? null;
      const taxDelinquent = r?.quickLists?.taxDefault ?? false;
      const absenteeOwner = r?.quickLists?.absenteeOwner ?? false;

      if (!fullAddress) { skipped++; continue; }

      const { error } = await supabase
        .from("has_contacts")
        .upsert({
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
      results_returned: results.length,
      inserted,
      skipped,
    });

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}                dataSelection: {
                  corePropertyData: true,
                },
              },
            },
            limit,
          },
        }],
      }),
    });

    const bdJson = await bdRes.json();
    const results = bdJson?.result?.data ?? [];

    if (!results.length) {
      return NextResponse.json({
        success: false,
        message: "No results returned",
        raw: bdJson,
      }, { status: 404 });
    }

    // Upsert each result into has_contacts
    let inserted = 0;
    let skipped = 0;

    for (const r of results) {
      const property = r?.property ?? {};
      const address = property?.address?.fullAddress ?? null;
      const ownerName = property?.owners?.[0]?.name?.full ?? null;
      const mailingAddress = property?.mailingAddress?.fullAddress ?? null;
      const taxDelinquent = property?.taxDelinquent ?? false;

      if (!address) { skipped++; continue; }

      const { error } = await supabase
        .from("has_contacts")
        .upsert({
          full_name: ownerName,
          mailing_address: mailingAddress,
          notes: address,
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
      results_returned: results.length,
      inserted,
      skipped,
      zips_searched: zips,
    });

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
