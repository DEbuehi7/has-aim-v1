export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const verified = cookieStore.get("aura8_verified")?.value === "true";
    const email = cookieStore.get("aura8_email")?.value ?? null;
    return NextResponse.json({ verified, email });
  } catch (e) {
    return NextResponse.json({ verified: false, email: null });
  }
}
