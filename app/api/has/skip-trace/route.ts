export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { address, city, state, zip, owner_name } = body;
    if (!address) {
      return NextResponse.json({ error: "address is required" }, { status: 400 });
    }
    const batchRes = await fetch("https://api.batchdata.com/api/v3/property/skip-trace", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.BATCHDATA_API_TOKEN,
      },
      body: JSON.stringify({
        requests: [{ propertyAddress: { street: address, city: city || "Los Angeles", state: state || "CA", zip: zip || "" } }],
      }),
    });
    const rawText = await batchRes.text();
    return NextResponse.json({ status: batchRes.status, raw: rawText.substring(0, 1000) });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
