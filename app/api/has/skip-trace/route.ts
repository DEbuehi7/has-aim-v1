export const dynamic = "force-dynamic";import { NextResponse } from "next/server";

export async function POST(req) {
try {
const body = await req.json();
const { address, city, state, zip, owner_name } = body;

const token = process.env.BATCHDATA_API_TOKEN;

const batchRes = await fetch("https://api.batchdata.com/api/v1/property/skip-trace", {
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": `Bearer ${token}`,
},
body: JSON.stringify({
requests: [
{
propertyAddress: {
street: address,
city: city || "Los Angeles",
state: state || "CA",
zip: zip || "",
},
},
],
}),
});

const rawText = await batchRes.text();

return NextResponse.json({
status: batchRes.status,
token_prefix: token ? token.substring(0, 6) : "MISSING",
raw: rawText.substring(0, 500),
});

} catch (e) {
return NextResponse.json({ error: String(e) }, { status: 500 });
}
}    });

    if (!batchRes.ok) {
      const err = await batchRes.text();
      return NextResponse.json({ error: "BatchData API error", detail: err }, { status: 502 });
    }

    const batchData = await batchRes.json();
    const result = batchData?.results?.[0];

    if (!result) {
      return NextResponse.json({ error: "No result returned from BatchData" }, { status: 404 });
    }

    const person = result?.persons?.[0] ?? {};
    const phones = person?.phones ?? [];
    const emails = person?.emails ?? [];
    const fullName = person?.fullName ?? owner_name ?? "Unknown";
    const primaryPhone = phones?.[0]?.number ?? null;
    const primaryEmail = emails?.[0]?.email ?? null;
    const doNotCall = phones?.[0]?.doNotCall ?? false;

    const contactPayload = {
      full_name: fullName,
      property_address: address,
      city: city || "Los Angeles",
      state: state || "CA",
      zip: zip || null,
      phone_primary: primaryPhone,
      email_primary: primaryEmail,
      do_not_call: doNotCall,
      phones_raw: JSON.stringify(phones),
      emails_raw: JSON.stringify(emails),
      skip_trace_raw: JSON.stringify(result),
      skip_traced_at: new Date().toISOString(),
      source: "batchdata_v3",
      status: "new",
    };

    const { data: contact, error: dbError } = await supabase
      .from("has_contacts")
      .upsert(contactPayload, { onConflict: "property_address" })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({
        success: false,
        db_error: dbError.message,
        batch_result: contactPayload,
      }, { status: 207 });
    }

    return NextResponse.json({
      success: true,
      contact,
      phones_found: phones.length,
      emails_found: emails.length,
      do_not_call: doNotCall,
    });

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
