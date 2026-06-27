/**
 * /admin/ccbill — Internal CCBill Webhook & Subscriber Debug Page
 *
 * TEMPORARY PROTECTION: This page is guarded by a server-side secret check.
 * Access requires either:
 *   - Query param:  /admin/ccbill?secret=<ADMIN_DEBUG_SECRET>
 *   - Header:       x-admin-secret: <ADMIN_DEBUG_SECRET>
 *
 * Required env var: ADMIN_DEBUG_SECRET
 * Add it to .env.local (local) and Vercel environment variables (production).
 *
 * This is a temporary measure. Replace with real auth (middleware session,
 * Vercel password protection, or IP allowlist) before wider team use.
 * See docs/ccbill-admin-debug.md for upgrade options.
 *
 * This is a Server Component — all data fetching happens server-side.
 * No client-side JS is needed.
 */

import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { fetchAdminData, WebhookEventRow, SubscriberRow } from "@/lib/aura8/admin-data";

// ---------------------------------------------------------------------------
// Styles (inline — no extra CSS files needed)
// ---------------------------------------------------------------------------

const S = {
  page: {
    fontFamily: "DM Mono, monospace",
    background: "#060608",
    color: "#E8E8F0",
    minHeight: "100vh",
    padding: "32px 24px",
  } as React.CSSProperties,
  header: {
    marginBottom: "32px",
  } as React.CSSProperties,
  badge: {
    display: "inline-block",
    background: "#FF006E20",
    border: "1px solid #FF006E",
    color: "#FF006E",
    fontSize: "10px",
    letterSpacing: "0.15em",
    padding: "3px 10px",
    borderRadius: "4px",
    marginBottom: "12px",
  } as React.CSSProperties,
  h1: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#FFF",
    margin: "0 0 6px",
  } as React.CSSProperties,
  meta: {
    fontSize: "11px",
    color: "#52525B",
  } as React.CSSProperties,
  section: {
    marginBottom: "48px",
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#FF006E",
    letterSpacing: "0.12em",
    marginBottom: "12px",
    textTransform: "uppercase" as const,
  },
  errorBox: {
    background: "#1A0A0A",
    border: "1px solid #FF006E60",
    borderRadius: "6px",
    padding: "12px 16px",
    fontSize: "12px",
    color: "#FF6B6B",
    marginBottom: "24px",
  } as React.CSSProperties,
  tableWrap: {
    overflowX: "auto" as const,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "11px",
  } as React.CSSProperties,
  th: {
    textAlign: "left" as const,
    padding: "8px 10px",
    background: "#0D0D0F",
    color: "#71717A",
    borderBottom: "1px solid #27272A",
    whiteSpace: "nowrap" as const,
    fontWeight: 600,
    letterSpacing: "0.05em",
  } as React.CSSProperties,
  td: {
    padding: "7px 10px",
    borderBottom: "1px solid #18181B",
    color: "#A1A1AA",
    maxWidth: "200px",
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
  tdHighlight: {
    padding: "7px 10px",
    borderBottom: "1px solid #18181B",
    color: "#E8E8F0",
    fontWeight: 600,
  } as React.CSSProperties,
  empty: {
    padding: "24px",
    textAlign: "center" as const,
    color: "#3F3F46",
    fontSize: "12px",
    background: "#0D0D0F",
    borderRadius: "6px",
  } as React.CSSProperties,
  pill: (ok: boolean) => ({
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: 700,
    background: ok ? "#052e16" : "#450a0a",
    color: ok ? "#4ade80" : "#f87171",
  } as React.CSSProperties),
  statusPill: (status: string | null) => {
    const color =
      status === "active" ? { bg: "#052e16", fg: "#4ade80" } :
      status === "cancelled" || status === "expired" ? { bg: "#1c1917", fg: "#a8a29e" } :
      status === "declined" || status === "chargeback" ? { bg: "#450a0a", fg: "#f87171" } :
      { bg: "#1c1917", fg: "#71717A" };
    return {
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "10px",
      fontWeight: 700,
      background: color.bg,
      color: color.fg,
    } as React.CSSProperties;
  },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function fmt(val: string | null | undefined): string {
  if (!val) return "—";
  // Truncate long IDs for display
  if (val.length > 36) return val.slice(0, 34) + "..";
  return val;
}

function fmtDate(val: string | null | undefined): string {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return val;
  }
}

function fmtAmount(val: number | null): string {
  if (val === null || val === undefined) return "—";
  return `$${val.toFixed(2)}`;
}

function WebhookTable({ rows }: { rows: WebhookEventRow[] }) {
  if (rows.length === 0) {
    return <div style={S.empty}>No events found.</div>;
  }
  return (
    <div style={S.tableWrap}>
      <table style={S.table}>
        <thead>
          <tr>
            {["Created", "Event Type", "Email", "Sub ID", "Txn ID", "Status", "Amount", "Affiliate", "Subacc", "Campaign", "OK", "Error"].map(h => (
              <th key={h} style={S.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <td style={S.td}>{fmtDate(row.created_at)}</td>
              <td style={S.tdHighlight}>{fmt(row.event_type)}</td>
              <td style={S.td}>{fmt(row.email)}</td>
              <td style={S.td}>{fmt(row.subscription_id)}</td>
              <td style={S.td}>{fmt(row.transaction_id)}</td>
              <td style={S.td}>
                <span style={S.statusPill(row.status)}>{row.status ?? "—"}</span>
              </td>
              <td style={S.td}>{fmtAmount(row.amount)}</td>
              <td style={S.td}>{fmt(row.affiliate)}</td>
              <td style={S.td}>{fmt(row.subaccount)}</td>
              <td style={S.td}>{fmt(row.campaign)}</td>
              <td style={S.td}>
                <span style={S.pill(row.processed)}>{row.processed ? "yes" : "no"}</span>
              </td>
              <td style={{ ...S.td, color: row.processing_error ? "#f87171" : "#3F3F46" }}>
                {fmt(row.processing_error)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubscriberTable({ rows }: { rows: SubscriberRow[] }) {
  if (rows.length === 0) {
    return <div style={S.empty}>No subscribers found.</div>;
  }
  return (
    <div style={S.tableWrap}>
      <table style={S.table}>
        <thead>
          <tr>
            {["Updated", "Email", "Sub ID", "Customer ID", "Status", "Affiliate", "Subacc", "Campaign", "Tracking", "Last Payment"].map(h => (
              <th key={h} style={S.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <td style={S.td}>{fmtDate(row.updated_at)}</td>
              <td style={S.tdHighlight}>{fmt(row.email)}</td>
              <td style={S.td}>{fmt(row.subscription_id)}</td>
              <td style={S.td}>{fmt(row.customer_id)}</td>
              <td style={S.td}>
                <span style={S.statusPill(row.status)}>{row.status ?? "—"}</span>
              </td>
              <td style={S.td}>{fmt(row.affiliate)}</td>
              <td style={S.td}>{fmt(row.subaccount)}</td>
              <td style={S.td}>{fmt(row.campaign)}</td>
              <td style={S.td}>{fmt(row.tracking_id)}</td>
              <td style={S.td}>{fmtDate(row.last_payment_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Secret guard
// ---------------------------------------------------------------------------

/**
 * Validate the incoming request against ADMIN_DEBUG_SECRET.
 * Accepts the secret via:
 *   1. Query param:  ?secret=<value>
 *   2. Request header: x-admin-secret: <value>
 *
 * Returns true if the request is authorized, false otherwise.
 * If ADMIN_DEBUG_SECRET is not set, the page is always blocked (fail-closed).
 */
async function isAuthorized(
  searchParams: Record<string, string | string[] | undefined>
): Promise<boolean> {
  const secret = process.env.ADMIN_DEBUG_SECRET;

  // Fail-closed: if no secret is configured, block all access.
  // Set ADMIN_DEBUG_SECRET in your env to enable the page.
  if (!secret) return false;

  // Check query param first
  const querySecret = searchParams["secret"];
  if (typeof querySecret === "string" && querySecret === secret) return true;

  // Check request header
  const headerStore = await headers();
  const headerSecret = headerStore.get("x-admin-secret");
  if (headerSecret === secret) return true;

  return false;
}

export default async function CCBillAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;

  // Guard — returns 404 if secret is missing or wrong.
  // Does not reveal that the page exists.
  if (!(await isAuthorized(resolvedParams))) {
    notFound();
  }

  const data = await fetchAdminData();

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.badge}>INTERNAL — SECRET PROTECTED</div>
        <h1 style={S.h1}>CCBill Webhook &amp; Subscriber Debug</h1>
        <p style={S.meta}>
          Fetched at {fmtDate(data.fetchedAt)} &nbsp;|&nbsp;
          {data.recentEvents.length} events &nbsp;|&nbsp;
          {data.recentSubscribers.length} subscribers &nbsp;|&nbsp;
          {data.errorEvents.length} errors
        </p>
      </div>

      {/* Fetch errors */}
      {data.errors.length > 0 && (
        <div style={S.errorBox}>
          <strong>Data fetch errors:</strong>
          <ul style={{ margin: "6px 0 0", paddingLeft: "16px" }}>
            {data.errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {/* Unprocessed / errored events */}
      <div style={S.section}>
        <div style={S.sectionTitle}>
          Unprocessed / Errored Events ({data.errorEvents.length})
        </div>
        <WebhookTable rows={data.errorEvents} />
      </div>

      {/* Recent webhook events */}
      <div style={S.section}>
        <div style={S.sectionTitle}>
          Recent Webhook Events — latest 25
        </div>
        <WebhookTable rows={data.recentEvents} />
      </div>

      {/* Recent subscribers */}
      <div style={S.section}>
        <div style={S.sectionTitle}>
          Recent Subscribers — latest 25
        </div>
        <SubscriberTable rows={data.recentSubscribers} />
      </div>

      {/* Footer note */}
      <div style={{ ...S.errorBox, marginTop: "32px" }}>
        <strong>SECURITY NOTE:</strong> This page is protected by{" "}
        <code>ADMIN_DEBUG_SECRET</code>. Replace with real auth (middleware
        session or Vercel password protection) before wider team use. See{" "}
        <code>docs/ccbill-admin-debug.md</code>.
      </div>
    </div>
  );
}
