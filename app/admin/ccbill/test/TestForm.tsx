"use client";
import { useState } from "react";

interface EventOption { key: string; label: string; expectedStatus: string; description: string; }
interface Props { secret: string; eventOptions: EventOption[]; }

const C = {
  card: "#0D0D0F", border: "#1A1A2E", pink: "#FF006E", muted: "#71717A",
  text: "#E8E8F0", white: "#FFF", faint: "#3F3F46", font: "DM Mono, monospace",
  inputBg: "#141416", errorBg: "#2D0A0A", errorText: "#EF4444",
  successText: "#10B981", warnBg: "#1A1200", warnText: "#F59E0B",
};

function statusColor(s: string) {
  if (s === "active") return "#10B981";
  if (["cancelled", "expired", "declined"].includes(s)) return "#EF4444";
  if (["chargeback", "refunded"].includes(s)) return "#F59E0B";
  return "#71717A";
}

const inp: React.CSSProperties = {
  width: "100%", background: C.inputBg, border: "1px solid #252528",
  borderRadius: "4px", padding: "10px 12px", color: C.text, fontSize: "12px",
  fontFamily: C.font, outline: "none", boxSizing: "border-box",
};

export default function TestForm({ secret, eventOptions }: Props) {
  const [eventKey, setEventKey] = useState(eventOptions[0]?.key ?? "sale");
  const [email, setEmail]       = useState("test@example.com");
  const [subId, setSubId]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<Record<string, unknown> | null>(null);
  const [reqError, setReqError] = useState("");
  const selected = eventOptions.find(o => o.key === eventKey);

  const handleInject = async () => {
    setLoading(true); setResult(null); setReqError("");
    const overrides: Record<string, string> = {};
    if (email) overrides.email = email;
    if (subId) overrides.subscriptionId = subId;
    try {
      const res = await fetch(`/api/ccbill/webhook/test?secret=${encodeURIComponent(secret)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventKey, overrides }),
      });
      const data = await res.json();
      setResult(data);
      if (!data.ok) setReqError(data.error ?? "Unknown error");
    } catch (e) { setReqError("Network error: " + String(e)); }
    setLoading(false);
  };

  const col: React.CSSProperties = { background: C.card, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "24px" };
  const hdr: React.CSSProperties = { fontSize: "11px", color: C.pink, letterSpacing: "0.15em", marginBottom: "16px" };
  const lbl: React.CSSProperties = { fontSize: "10px", color: C.muted, letterSpacing: "0.1em", marginBottom: "6px", display: "block" };
  const field: React.CSSProperties = { marginBottom: "16px" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", maxWidth: "900px" }}>

      {/* ── Left: form ───────────────────────────────────────────────────────── */}
      <div style={col}>
        <div style={hdr}>INJECT TEST EVENT</div>
        <div style={field}>
          <label style={lbl}>EVENT TYPE</label>
          <select value={eventKey} onChange={e => setEventKey(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
            {eventOptions.map(o => <option key={o.key} value={o.key}>{o.label} → {o.expectedStatus}</option>)}
          </select>
        </div>
        {selected && (
          <div style={{ background: "#141416", borderRadius: "4px", padding: "10px 12px", marginBottom: "16px", fontSize: "11px", color: C.muted, lineHeight: 1.6 }}>
            {selected.description}
          </div>
        )}
        <div style={field}>
          <label style={lbl}>EMAIL</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="test@example.com" style={inp} />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={lbl}>SUBSCRIPTION ID (optional)</label>
          <input type="text" value={subId} onChange={e => setSubId(e.target.value)} placeholder="leave blank for template default" style={inp} />
        </div>
        <button onClick={handleInject} disabled={loading} style={{ width: "100%", background: loading ? "#333" : C.pink, border: "none", borderRadius: "4px", padding: "12px", color: C.white, fontSize: "12px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: C.font, letterSpacing: "0.08em" }}>
          {loading ? "INJECTING..." : `INJECT ${(selected?.label ?? "EVENT").toUpperCase()}`}
        </button>
        {reqError && <div style={{ marginTop: "12px", background: C.errorBg, borderRadius: "4px", padding: "10px", fontSize: "11px", color: C.errorText }}>{reqError}</div>}
      </div>

      {/* ── Right: result ────────────────────────────────────────────────────── */}
      <div style={col}>
        <div style={hdr}>RESULT</div>
        {!result && !loading && <div style={{ color: C.faint, fontSize: "12px" }}>Inject an event to see results here.</div>}
        {loading && <div style={{ color: C.muted, fontSize: "12px" }}>Processing...</div>}
        {result && !loading && (
          <>
            <div style={{ marginBottom: "14px" }}>
              <span style={{ background: result.ok ? "#001A0A" : C.errorBg, border: `1px solid ${result.ok ? "#10B98140" : "#EF444440"}`, color: result.ok ? C.successText : C.errorText, fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "4px" }}>
                {result.ok ? "SUCCESS" : "FAILED"}
              </span>
            </div>
            <div style={{ marginBottom: "12px", fontSize: "12px", color: C.text }}>{String(result.summary ?? "")}</div>
            {([
              ["Subscriber Status", result.subscriberStatus],
              ["Event Type",        result.eventType],
              ["Email",             result.email],
              ["Event Row ID",      result.webhookEventId],
            ] as [string, unknown][]).map(([k, v]) => v ? (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "11px" }}>
                <span style={{ color: C.muted }}>{k}</span>
                <span style={{ color: k === "Subscriber Status" ? statusColor(String(v)) : C.text, fontWeight: k === "Subscriber Status" ? 700 : 400 }}>{String(v)}</span>
              </div>
            ) : null)}
            {Array.isArray(result.warnings) && (result.warnings as string[]).length > 0 && (
              <div style={{ marginTop: "10px", background: C.warnBg, borderRadius: "4px", padding: "10px", fontSize: "11px", color: C.warnText }}>
                {(result.warnings as string[]).map((w, i) => <div key={i}>⚠ {w}</div>)}
              </div>
            )}
            <a href={`/admin/ccbill?secret=${encodeURIComponent(secret)}`} style={{ display: "block", marginTop: "14px", textAlign: "center", background: "#141416", border: "1px solid #252528", borderRadius: "4px", padding: "10px", fontSize: "11px", color: C.pink, textDecoration: "none" }}>
              VIEW IN ADMIN DEBUG →
            </a>
            <details style={{ marginTop: "12px" }}>
              <summary style={{ fontSize: "10px", color: C.faint, cursor: "pointer" }}>RAW JSON</summary>
              <pre style={{ marginTop: "8px", background: "#141416", borderRadius: "4px", padding: "10px", fontSize: "10px", color: C.muted, overflowX: "auto", whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>
            </details>
          </>
        )}
      </div>

    </div>
  );
}
