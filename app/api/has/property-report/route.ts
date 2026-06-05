export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { contact_id, address, city, state, zip, bedrooms, bathrooms } = await req.json();

    if (!contact_id || !address) {
      return NextResponse.json({ error: "contact_id and address required" }, { status: 400 });
    }

    // STEP 1 -- BatchData property lookup
    const bdRes = await fetch("https://api.batchdata.com/api/v3/property/skip-trace", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.BATCHDATA_API_TOKEN,
      },
      body: JSON.stringify({
        requests: [{ propertyAddress: { street: address, city: city || "Los Angeles", state: state || "CA", zip: zip || "" } }],
      }),
    });

    const bdJson = await bdRes.json();
    const bdResult = bdJson?.result?.data?.[0];
    const property = bdResult?.property ?? {};
    const person = bdResult?.persons?.[0] ?? {};
    const phones = person?.phones ?? [];
    const ownerName = property?.owners?.[0]?.name?.full ?? "Unknown";
    const mailingAddress = property?.mailingAddress?.fullAddress ?? null;
    const asIsValue = property?.valuation?.estimatedValue ?? null;
    const arvEstimate = property?.valuation?.estimatedMaxValue ?? null;
    const taxDelinquent = property?.taxDelinquent ?? false;
    const openViolations = property?.violations?.open ?? 0;
    const sqft = property?.squareFeet ?? null;
    const yearBuilt = property?.yearBuilt ?? null;
    const beds = bedrooms ?? property?.bedrooms ?? 3;
    const baths = bathrooms ?? property?.bathrooms ?? 2;

    // STEP 2 -- Rentcast rental comps
    const rentParams = new URLSearchParams({
      address: `${address}, ${city || "Los Angeles"}, ${state || "CA"} ${zip || ""}`.trim(),
      propertyType: "Single Family",
      bedrooms: String(beds),
      bathrooms: String(baths),
    });

    const rentRes = await fetch(
      `https://api.rentcast.io/v1/avm/rent/long-term?${rentParams}`,
      {
        method: "GET",
        headers: {
          "X-Api-Key": process.env.RENTCAST_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const rentJson = await rentRes.json();
    const rentEstimate = rentJson?.rent ?? null;
    const rentLow = rentJson?.rentRangeLow ?? null;
    const rentHigh = rentJson?.rentRangeHigh ?? null;

    // STEP 3 -- Claude API 3 value-add scenarios
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: `You are a real estate investment analyst. Generate exactly 3 value-add scenarios for this property. Respond in JSON only with no preamble or markdown.

Property data:
- Address: ${address}, ${city}, ${state} ${zip}
- Owner: ${ownerName}
- As-is value: $${asIsValue ?? "unknown"}
- ARV estimate: $${arvEstimate ?? "unknown"}
- Rental estimate: $${rentEstimate ?? "unknown"}/mo
- Sqft: ${sqft ?? "unknown"}
- Year built: ${yearBuilt ?? "unknown"}
- Bedrooms: ${beds} | Bathrooms: ${baths}
- Tax delinquent: ${taxDelinquent}
- Open violations: ${openViolations}

Return this exact JSON structure:
{
  "scenario_a": {
    "name": "Lipstick Flip",
    "scope": "description of work",
    "cost_low": 15000,
    "cost_high": 25000,
    "timeline_days": 45,
    "arv_after": 000000,
    "roi_percent": 00,
    "risk": "Low",
    "best_for": "type of buyer"
  },
  "scenario_b": {
    "name": "Full Rehab",
    "scope": "description of work",
    "cost_low": 60000,
    "cost_high": 90000,
    "timeline_days": 120,
    "arv_after": 000000,
    "roi_percent": 00,
    "risk": "Medium",
    "best_for": "type of buyer"
  },
  "scenario_c": {
    "name": "ADU + Conversion",
    "scope": "description of work",
    "cost_low": 120000,
    "cost_high": 180000,
    "timeline_days": 240,
    "arv_after": 000000,
    "roi_percent": 00,
    "risk": "Medium-High",
    "best_for": "type of buyer"
  }
}`,
          },
        ],
      }),
    });

    const claudeJson = await claudeRes.json();
    const claudeText = claudeJson?.content?.[0]?.text ?? "{}";
    let scenarios = {};
try {
  const cleaned = claudeText.replace(/```json|```/g, "").trim();
  scenarios = JSON.parse(cleaned);
} catch (e) {
  scenarios = { error: "Claude parse failed", raw: claudeText };
}
    // STEP 4 -- Write to has_property_reports
    const { data: report, error: dbError } = await supabase
      .from("has_property_reports")
      .insert({
        contact_id,
        property_address: address,
        as_is_value: asIsValue,
        arv_estimate: arvEstimate,
        rental_rate_estimate: rentEstimate,
        rent_range_low: rentLow,
        rent_range_high: rentHigh,
        owner_name: ownerName,
        mailing_address: mailingAddress,
        bedrooms: beds,
        bathrooms: baths,
        sqft,
        year_built: yearBuilt,
        tax_delinquent: taxDelinquent,
        open_violations: openViolations,
        scenario_a: scenarios?.scenario_a ?? null,
        scenario_b: scenarios?.scenario_b ?? null,
        scenario_c: scenarios?.scenario_c ?? null,
        generated_by: "claude-sonnet-4-5",
        model_version: "20250514",
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({
        success: false,
        db_error: dbError.message,
        scenarios,
      }, { status: 207 });
    }

    return NextResponse.json({
      success: true,
      report,
    });

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
