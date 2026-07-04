/**
 * POST /api/ccbill/webhook/test
 * GET  /api/ccbill/webhook/test   ← returns available template keys
 *
 * Internal endpoint for injecting test CCBill webhook events.
 * Runs the exact same processWebhook() pipeline as the real endpoint.
 *
 * SECURITY: Requires ADMIN_DEBUG_SECRET (query param or x-admin-secret header).
 * Fail-closed: ADMIN_DEBUG_SECRET not set → all requests return 404.
 *
 * See docs/ccbill-testing.md for cURL examples and full usage guide.
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { processWebhook } from "@/lib/ccbill/process-webhook";
import { buildTestBody, TEST_PAYLOADS, TestEventKey } from "@/lib/ccbill/test-payloads";
import { headers } from "next/headers";

// ---------------------------------------------------------------------------
// Auth — identical pattern to app/admin/ccbill/page.tsx
// ---------------------------------------------------------------------------

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const secret = process.env.ADMIN_DEBUG_SECRET;
  if (!secret) return false;
  if (req.nextUrl.searchParams.get("secret") === secret) return true;
  const headerStore = await headers();
  if (headerStore.get("x-admin-secret") === secret) return true;
  return false;
}

// ---------------------------------------------------------------------------
// POST — inject a test event
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  // ── Resolve URL-encoded payload ───────────────────────────────────────────
  let rawBody: string;

  if (body.raw && typeof body.raw === "object") {
    // Direct field map { eventType, email, ... }
    rawBody = new URLSearchParams(body.raw as Record<string, string>).toString();
  } else if (body.eventKey && typeof body.eventKey === "string") {
    // Named template + optional overrides
    const key = body.eventKey as TestEventKey;
    if (!TEST_PAYLOADS[key]) {
      return NextResponse.json(
        { error: `Unknown eventKey "${key}". Valid: ${Object.keys(TEST_PAYLOADS).join(", ")}` },
        { status: 400 }
      );
    }
    rawBody = buildTestBody(key, (body.overrides as Record<string, string>) ?? {});
  } else {
    return NextResponse.json(
      {
        error:
          'Body must include "eventKey" (template) or "raw" (field map). ' +
          `Valid eventKey values: ${Object.keys(TEST_PAYLOADS).join(", ")}`,
      },
      { status: 400 }
    );
  }

  // ── Validate minimum required fields ─────────────────────────────────────
  const p = new URLSearchParams(rawBody);
  const eventType = p.get("eventType") ?? p.get("event_type") ?? p.get("transactionType") ?? p.get("type");
  const email = p.get("email") ?? p.get("customerEmail");
  const subscriptionId = p.get("subscriptionId") ?? p.get("subscription_id") ?? p.get("subscriptionID");

  if (!eventType) {
    return NextResponse.json(
      { error: 'Payload must include "eventType" (or event_type / transactionType / type)' },
      { status: 400 }
    );
  }
  if (!email && !subscriptionId) {
    return NextResponse.json(
      { error: 'Payload must include at least "email" or "subscriptionId"' },
      { status: 400 }
    );
  }

  // ── Run the same pipeline as the real webhook ─────────────────────────────
  const result = await processWebhook({
    rawBody,
    capturedHeaders: {
      "content-type": "application/x-www-form-urlencoded",
      "x-test-injection": "true",
    },
    source: "test", // distinguishable in ccbill_webhook_events.source column
  });

  const status = result.error ? 500 : result.success ? 200 : 207;

  return NextResponse.json(
    {
      ok: !result.error,
      summary: result.summary,
      eventType: result.eventType,
      subscriberStatus: result.subscriberStatus,
      webhookEventId: result.webhookEventId,
      email: result.email,
      warnings: result.warnings,
      error: result.error,
      // Paste into browser (with your secret) to verify the result
      adminUrl: "/admin/ccbill",
    },
    { status }
  );
}

// ---------------------------------------------------------------------------
// GET — list available templates (auth still required)
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    description: "CCBill webhook test injection endpoint",
    usage: 'POST with { "eventKey": "<key>", "overrides": {} } or { "raw": { ... } }',
    eventKeys: Object.entries(TEST_PAYLOADS).map(([key, t]) => ({
      key,
      label: t.label,
      expectedStatus: t.expectedStatus,
      description: t.description,
    })),
    adminPage: "/admin/ccbill",
  });
}
