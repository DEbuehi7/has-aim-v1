export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const verified = cookieStore.get("aura8_verified")?.value === "true";
    return NextResponse.json({ verified });
  } catch (e) {
    return NextResponse.json({ verified: false });
  }
}
