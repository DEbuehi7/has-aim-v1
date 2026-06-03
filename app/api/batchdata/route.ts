export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";



const supabase = createClient(

process.env.NEXT_PUBLIC_SUPABASE_URL,

process.env.SUPABASE_SERVICE_ROLE_KEY

);



const BATCHDATA_URL = "https://api.batchdata.com/api/v3";

const BATCHDATA_KEY = process.env.BATCHDATA_API_TOKEN;




export async function POST(req) {

try {

const { contact_id, address } = await req.json();




if (!contact_id || !address) {

  return NextResponse.json({ error: "contact_id and address required" }, { status: 400 });

}



const bdRes = await fetch(BATCHDATA_URL + "/property/skip-trace", {

  method: "POST",

  headers: {

    "Content-Type": "application/json",

    "Authorization": "Bearer " + BATCHDATA_KEY,

  },

  body: JSON.stringify({

    requests: [{ address }],

  }),

});



const bdData = await bdRes.json();



if (!bdRes.ok) {

  return NextResponse.json({ error: "BatchData error", detail: bdData }, { status: 502 });

}



const result = bdData?.results?.[0];

const phones = result?.phones ?? [];

const emails = result?.emails ?? [];

const owner = result?.owner ?? {};



const updates = {

  skip_traced: true,

  batchdata_id: result?.id ?? null,

  phone_primary: phones[0]?.number ?? null,

  phone_secondary: phones[1]?.number ?? null,

  email: emails[0]?.address ?? null,

  full_name: owner?.fullName ?? null,

  mailing_address: owner?.mailingAddress ?? null,

  phone_verified: phones[0]?.verified ?? false,

  dnc: phones[0]?.dnc ?? false,

  tcpa_compliant: phones[0]?.tcpa ?? true,

  updated_at: new Date().toISOString(),

};



const { data, error } = await supabase

  .from("has_contacts")

  .update(updates)

  .eq("id", contact_id)

  .select()

  .single();



if (error) throw error;



return NextResponse.json({ success: true, contact: data, raw: result });




} catch (e) {

return NextResponse.json({ error: "Skip trace failed", detail: String(e) }, { status: 500 });

}

}
