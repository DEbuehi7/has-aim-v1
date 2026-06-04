export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { address, city, state, zip, bedrooms, bathrooms, propertyType } = body;

    if (!address) {
      return NextResponse.json({ error: "address is required" }, { status: 400 });
    }

    const params = new URLSearchParams({
      address: `${address}, ${city || "Los Angeles"}, ${state || "CA"} ${zip || ""}`.trim(),
      propertyType: propertyType || "Single Family",
      bedrooms: String(bedrooms || 3),
      bathrooms: String(bathrooms || 2),
    });

    const rentRes = await fetch(
      `https://api.rentcast.io/v1/avm/rent/long-term?${params}`,
      {
        method: "GET",
        headers: {
          "X-Api-Key": process.env.RENTCAST_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (!rentRes.ok) {
      const err = await rentRes.text();
      return NextResponse.json({ error: "Rentcast error", detail: err }, { status: 502 });
    }

    const rentData = await rentRes.json();

    return NextResponse.json({
      success: true,
      rent_estimate: rentData.rent,
      rent_range_low: rentData.rentRangeLow,
      rent_range_high: rentData.rentRangeHigh,
      comparables: rentData.comparables?.slice(0, 3) ?? [],
    });

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
