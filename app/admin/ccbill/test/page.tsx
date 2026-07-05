/**
 * /admin/ccbill/test — CCBill Webhook Test Injection UI
 *
 * Server Component shell: handles secret guard + passes secret to client.
 * Client Component: renders the form, fires the API call, shows results.
 *
 * Access:
 *   /admin/ccbill/test?secret=YOUR_ADMIN_DEBUG_SECRET
 *
 * What it does:
 *   - Pick an event type from a dropdown
 *   - Override email / subscriptionId inline
 *   - Click "Inject" → calls POST /api/ccbill/webhook/test
 *   - Shows the full JSON response with event ID and subscriber status
 *   - Links directly to /admin/ccbill to verify the result
 */

import { notFound } from "next/navigation";
import { headers } from "next/headers";
import TestForm from "./TestForm";
import { getTestEventOptions } from "@/lib/ccbill/test-payloads";

// ---------------------------------------------------------------------------
// Auth (same logic as app/admin/ccbill/page.tsx)
// ---------------------------------------------------------------------------

async function isAuthorized(
  params: Record<string, string | string[] | undefined>
): Promise<boolean> {
  const secret = process.env.ADMIN_DEBUG_SECRET;
  if (!secret) return false;
  const q = params["secret"];
  if (typeof q === "string" && q === secret) return true;
  const headerStore = await headers();
  if (headerStore.get("x-admin-secret") === secret) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const S = {
  page: { fontFamily: "DM Mono, monospace", background: "#060608", color: "#E8E8F0", minHeight: "100vh", padding: "32px 24px" } as React.CSSProperties,
  badge: { display: "inline-block", background: "#FF006E20", border: "1px solid #FF006E", color: "#FF006E", fontSize: "10px", letterSpacing: "0.15em", padding: "3px 10px", borderRadius: "4px", marginBottom: "12px" } as React.CSSProperties,
  h1: { fontSize: "20px", fontWeight: 800, color: "#FFF", margin: "0 0 6px" } as React.CSSProperties,
  meta: { fontSize: "11px", color: "#52525B", marginBottom: "32px" } as React.CSSProperties,
  link: { color: "#FF006E", textDecoration: "none", fontSize: "11px" } as React.CSSProperties,
};

export default async function CCBillTestPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;

  if (!(await isAuthorized(resolved))) {
    notFound();
  }

  // Pass the secret to the client form so it can include it in API calls.
  // The secret is already known to the user (they used it to load this page).
  const secret = (typeof resolved["secret"] === "string" ? resolved["secret"] : null) ??
    process.env.ADMIN_DEBUG_SECRET ?? "";

  const eventOptions = getTestEventOptions();

  return (
    <div style={S.page}>
      <div style={S.badge}>INTERNAL — SECRET PROTECTED</div>
      <h1 style={S.h1}>CCBill Webhook Test Injector</h1>
      <p style={S.meta}>
        Inject test events into the real processing pipeline.&nbsp;
        <a href={`/admin/ccbill?secret=${secret}`} style={S.link}>
          ← Back to Admin Debug
        </a>
      </p>

      <TestForm secret={secret} eventOptions={eventOptions} />
    </div>
  );
}
