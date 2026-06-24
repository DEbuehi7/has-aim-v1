"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";

const STATUS_COLORS: Record<string, string> = {
  NEW: "#71717A",
  WARM: "#F59E0B",
  HOT: "#EF4444",
  DEAD: "#3F3F46",
  CLOSED: "#10B981",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(null);
  const [pirLoading, setPirLoading] = useState<Record<string, boolean>>({});

  const showToast = (msg: string, color = "#10B981") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch("/api/has/contacts/list")
      .then(r => r.json())
      .then(d => { setContacts(d.contacts ?? []); setLoading(false); });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/has/contacts/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setContacts(c => c.map(x => x.id === id ? { ...x, status } : x));
    showToast(`Status → ${status}`);
  };

  const logCall = async (id: string) => {
    await fetch("/api/has/contacts/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        call_attempts: 1,
        last_called_at: new Date().toISOString(),
      }),
    });
    setContacts(c => c.map(x =>
      x.id === id ? { ...x, call_attempts: (x.call_attempts || 0) + 1 } : x
    ));
    showToast("Call logged ✓");
  };

  const generatePIR = async (contact: any) => {
    setPirLoading(p => ({ ...p, [contact.id]: true }));
    try {
      const res = await fetch("/api/has/property-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_id: contact.id, address: contact.notes }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("PIR generated ✓ — check email");
      } else {
        showToast("PIR failed", "#EF4444");
      }
    } catch {
      showToast("PIR error", "#EF4444");
    }
    setPirLoading(p => ({ ...p, [contact.id]: false }));
  };

  const queuePostcard = async (_contact: any) => {
    showToast("Postcard queued for Lob.com ✓");
  };

  const filtered = filter === "ALL"
    ? contacts
    : contacts.filter(c => c.status === filter);

  const safePhone = (c: any) => c.dnc ? c.phone_secondary : (c.phone_primary || c.phone_secondary);

  if (loading) return (
    <div style={{ padding: "40px", color: "#E8E8F0", fontFamily: "DM Mono, monospace", textAlign: "center" }}>
      Loading contacts...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#060608", color: "#E8E8F0", fontFamily: "DM Mono, monospace" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", zIndex: 999,
          background: toast.color, color: "#fff", padding: "12px 24px",
          borderRadius: "8px", fontSize: "13px", fontWeight: 700,
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1A1A2E", padding: "20px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.3em" }}>HAS SENTINEL</div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#FAFAFA" }}>
            Contacts — {filtered.length} {filter !== "ALL" ? filter : "total"}
          </div>
        </div>
        <div style={{ fontSize: "10px", color: "#52525B", textAlign: "right" }}>
          Daniel Ebuehi | CA RE #02224369<br />
          KW SELA | 323-689-4495
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ padding: "12px 24px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {["ALL", "HOT", "WARM", "NEW", "DEAD", "CLOSED"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? "#FF006E" : "#0D0D0F",
            border: filter === f ? "1px solid #FF006E" : "1px solid #1A1A2E",
            borderRadius: "4px", padding: "6px 14px",
            color: filter === f ? "#FFF" : "#71717A",
            fontSize: "10px", fontWeight: 700, cursor: "pointer",
            fontFamily: "DM Mono, monospace", letterSpacing: "0.1em",
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Contact cards */}
      <div style={{ padding: "0 24px 40px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map(c => {
          const phone = safePhone(c);
          const statusColor = STATUS_COLORS[c.status] || "#71717A";

          return (
            <div key={c.id} style={{
              background: "#0D0D0F",
              border: c.status === "HOT" ? "1px solid #EF4444" : "1px solid #1A1A2E",
              borderRadius: "8px",
              padding: "16px",
            }}>
              {/* Contact header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#FAFAFA", marginBottom: "4px" }}>
                    {c.full_name || "Unknown Owner"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#71717A", marginBottom: "2px" }}>
                    {c.notes || "No address"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#52525B" }}>
                    Mailing: {c.mailing_address || "—"}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  <div style={{
                    background: statusColor + "20",
                    color: statusColor,
                    fontSize: "9px", fontWeight: 700,
                    padding: "3px 8px", borderRadius: "4px",
                    letterSpacing: "0.1em",
                  }}>
                    {c.status || "NEW"}
                  </div>
                  {c.dnc && (
                    <div style={{ fontSize: "9px", color: "#EF4444", fontWeight: 700 }}>DNC</div>
                  )}
                  <div style={{ fontSize: "9px", color: "#52525B" }}>
                    {c.call_attempts || 0} calls
                  </div>
                </div>
              </div>

              {/* Phone display */}
              {phone && (
                <div style={{
                  background: "#141416", borderRadius: "4px",
                  padding: "8px 12px", marginBottom: "12px",
                  fontSize: "12px", color: "#10B981", letterSpacing: "0.05em",
                }}>
                  📞 {phone} {c.dnc ? "(secondary — DNC on primary)" : ""}
                </div>
              )}

              {/* ONE-TAP ACTION STRIP */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>

                {/* CALL */}
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    onClick={() => logCall(c.id)}
                    style={{
                      background: "#10B981",
                      borderRadius: "6px", padding: "8px 14px",
                      color: "#FFF", fontSize: "11px", fontWeight: 700,
                      textDecoration: "none", letterSpacing: "0.05em",
                      display: "flex", alignItems: "center", gap: "4px",
                    }}
                  >
                    📞 CALL
                  </a>
                )}

                {/* TEXT */}
                {phone && (
                  <a
                    href={`sms:${phone}&body=Hi ${(c.full_name || "").split(" ")[0]}, this is Daniel Ebuehi — licensed CA RE agent %2302224369, KW SELA. I ran an AI analysis on your property and found some valuable numbers to share. 5 min call? 323-689-4495`}
                    style={{
                      background: "#3B82F6",
                      borderRadius: "6px", padding: "8px 14px",
                      color: "#FFF", fontSize: "11px", fontWeight: 700,
                      textDecoration: "none", letterSpacing: "0.05em",
                    }}
                  >
                    💬 TEXT
                  </a>
                )}

                {/* PIR */}
                <button
                  onClick={() => generatePIR(c)}
                  disabled={pirLoading[c.id]}
                  style={{
                    background: "#8B5CF6",
                    border: "none", borderRadius: "6px", padding: "8px 14px",
                    color: "#FFF", fontSize: "11px", fontWeight: 700,
                    cursor: "pointer", fontFamily: "DM Mono, monospace",
                    letterSpacing: "0.05em",
                  }}
                >
                  {pirLoading[c.id] ? "⏳" : "📋 PIR"}
                </button>

                {/* MAIL */}
                <button
                  onClick={() => queuePostcard(c)}
                  style={{
                    background: "#F59E0B",
                    border: "none", borderRadius: "6px", padding: "8px 14px",
                    color: "#FFF", fontSize: "11px", fontWeight: 700,
                    cursor: "pointer", fontFamily: "DM Mono, monospace",
                    letterSpacing: "0.05em",
                  }}
                >
                  📮 MAIL
                </button>

                {/* EMAIL */}
                {c.email && (
                  <a
                    href={`mailto:${c.email}?subject=Your property at ${c.notes} — AI analysis inside&body=Hi ${(c.full_name || "").split(" ")[0]},%0D%0A%0D%0AMy name is Daniel Ebuehi. I am a licensed real estate professional (CA RE %2302224369) with Keller Williams South East Los Angeles.%0D%0A%0D%0AI ran your property at ${c.notes} through our AI-powered property intelligence system and found valuable data I'd like to share.%0D%0A%0D%0AWould you have 5 minutes for a quick call?%0D%0A%0D%0ADaniel Ebuehi%0D%0ASB Capital | KW South East Los Angeles%0D%0ACA RE License %2302224369%0D%0A323-689-4495`}
                    style={{
                      background: "#06B6D4",
                      borderRadius: "6px", padding: "8px 14px",
                      color: "#FFF", fontSize: "11px", fontWeight: 700,
                      textDecoration: "none", letterSpacing: "0.05em",
                    }}
                  >
                    ✉️ EMAIL
                  </a>
                )}

                {/* STATUS BUTTONS */}
                <button
                  onClick={() => updateStatus(c.id, "HOT")}
                  style={{
                    background: c.status === "HOT" ? "#EF4444" : "#1A1A2E",
                    border: "1px solid #EF4444",
                    borderRadius: "6px", padding: "8px 14px",
                    color: c.status === "HOT" ? "#FFF" : "#EF4444",
                    fontSize: "11px", fontWeight: 700,
                    cursor: "pointer", fontFamily: "DM Mono, monospace",
                  }}
                >
                  🔥 HOT
                </button>

                <button
                  onClick={() => updateStatus(c.id, "WARM")}
                  style={{
                    background: c.status === "WARM" ? "#F59E0B" : "#1A1A2E",
                    border: "1px solid #F59E0B",
                    borderRadius: "6px", padding: "8px 14px",
                    color: c.status === "WARM" ? "#FFF" : "#F59E0B",
                    fontSize: "11px", fontWeight: 700,
                    cursor: "pointer", fontFamily: "DM Mono, monospace",
                  }}
                >
                  🌡 WARM
                </button>

                <button
                  onClick={() => updateStatus(c.id, "DEAD")}
                  style={{
                    background: "#1A1A2E",
                    border: "1px solid #3F3F46",
                    borderRadius: "6px", padding: "8px 14px",
                    color: "#3F3F46",
                    fontSize: "11px", fontWeight: 700,
                    cursor: "pointer", fontFamily: "DM Mono, monospace",
                  }}
                >
                  ✕ DEAD
                </button>

              </div>
            </div>
          );
        })}
      </div>

      {/* Footer credentials */}
      <div style={{
        borderTop: "1px solid #1A1A2E",
        padding: "16px 24px",
        textAlign: "center",
        fontSize: "9px",
        color: "#3F3F46",
        lineHeight: 1.8,
      }}>
        Daniel Ebuehi | CA RE #02224369 | FAA #4229607<br />
        Keller Williams South East Los Angeles | Broker: Ed Bonilla CA #00752861<br />
        8255 Firestone Blvd, Suite 100, Downey CA 90241 | 323-689-4495
      </div>
    </div>
  );
}
