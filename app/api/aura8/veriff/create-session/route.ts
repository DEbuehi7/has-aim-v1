export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";
    const userAgent = req.headers.get("user-agent") ?? "unknown";
    const body = await req.json();
    const vendorData = body.userId ?? crypto.randomUUID();

    const veriffRes = await fetch("https://stationapi.veriff.com/v1/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-AUTH-CLIENT": process.env.VERIFF_API_KEY,
      },
      body: JSON.stringify({
        verification: {
          callback: "https://www.aura8.fun/aura8/verified",
          vendorData,
          timestamp: new Date().toISOString(),
          lang: "en",
        },
      }),
    });

    const veriffData = await veriffRes.json();
    const sessionId = veriffData?.verification?.id;
    const sessionUrl = veriffData?.verification?.url;

    if (!sessionId) {
      return NextResponse.json({ error: "Veriff session creation failed", detail: veriffData }, { status: 502 });
    }

    await supabase.from("aura8_veriff_sessions").insert({
      session_id: sessionId,
      vendor_data: vendorData,
      status: "created",
      ip_address: ip,
      user_agent: userAgent,
    });

    return NextResponse.json({
      success: true,
      session_id: sessionId,
      session_url: sessionUrl,
      vendor_data: vendorData,
    });

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}    const sessionUrl = veriffData?.verification?.url;

    if (!sessionId) {
      return NextResponse.json({ error: "Veriff session creation failed", detail: veriffData }, { status: 502 });
    }

    await supabase.from("aura8_veriff_sessions").insert({
      session_id: sessionId,
      vendor_data: vendorData,
      status: "created",
      ip_address: ip,
      user_agent: userAgent,
    });

    return NextResponse.json({
      success: true,
      session_id: sessionId,
      session_url: sessionUrl,
      vendor_data: vendorData,
    });

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
