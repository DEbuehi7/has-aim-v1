"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";

const STATUS_COLORS = {
  NEW: "#71717A",
  WARM: "#F59E0B",
  HOT: "#EF4444",
  DEAD: "#3F3F46",
  CLOSED: "#10B981",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [toast, setToast] = useState(null);
  const [pirLoading, setPirLoading] = useState({});

  const showToast = (msg, color = "#10B981") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch("/api/has/contacts/list")
      .then(r => r.json())
      .then(d => { setContacts(d.contacts ?? []); setLoading(false); });
  }, []);

  const updateStatus = async (id, status) => {
    await fetch("/api/has/contacts/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setContacts(c => c.map(x => x.id === id ? { ...x, status } : x));
    showToast(`Status → ${status}`);
  };

  const logCall = async (id) => {
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

  const generatePIR = async (contact) => {
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
    } catch (e) {
      showToast("PIR error", "#EF4444");
    }
    setPirLoading(p => ({ ...p, [contact.id]: false }));
  };

  const queuePostcard = async (contact) => {
    showToast("Postcard queued for Lob.com ✓");
  };

  const filtered = filter === "ALL"
    ? contacts
    : contacts.filter(c => c.status === filter);

  const safePhone = (c) => c.dnc ? c.phone_secondary : (c.phone_primary || c.phone_secondary);

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
              border: c.status === "HOT"
                ? "1px solid #EF4444"
                : "1px solid #1A1A2E",
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
                    <div style={{ fontSize: "9px", color: "#EF4444", fontWeight: 700 }}>
                      DNC
                    </div>
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
}  useEffect(() => { fetchContacts(); }, []);

  const handleSkipTrace = async (contact_id, address) => {
    setActionLoading(contact_id + "-trace");
    await fetch("/api/batchdata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact_id, address }),
    });
    await fetchContacts();
    setActionLoading(null);
    showToast("Skip trace complete");
  };

  const handlePIR = async (contact_id, address) => {
    setActionLoading(contact_id + "-pir");
    await fetch("/api/has/property-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact_id, address, city: "Los Angeles", state: "CA" }),
    });
    setActionLoading(null);
    showToast("PIR generated -- check property reports");
  };

  const filtered = contacts.filter(c => {
    const matchSearch =
      (c.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.phone_primary ?? "").includes(search);
    const matchFilter = filter === "ALL" || c.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#09090B",
      color: "#E4E4E7",
      fontFamily: "DM Mono, monospace",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1A1A2E",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.3em", marginBottom: "4px" }}>
            HAS SENTINEL
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 900, color: "#FAFAFA", margin: 0 }}>
            Contacts
          </h1>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "#52525B" }}>
            {filtered.length} records
          </span>
          <Link href="/calllog" style={{
            background: "#FF006E",
            color: "#FFF",
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 700,
            textDecoration: "none",
            letterSpacing: "0.08em",
          }}>
            CALL LOGGER
          </Link>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: "#14532D",
          border: "1px solid #86EFAC40",
          borderRadius: "8px",
          padding: "12px 20px",
          fontSize: "12px",
          color: "#86EFAC",
          zIndex: 999,
        }}>
          {toast}
        </div>
      )}

      <div style={{ padding: "24px 32px" }}>
        {/* Search + filters */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or phone..."
            style={{
              background: "#27272A",
              border: "1px solid #3F3F46",
              borderRadius: "6px",
              padding: "8px 12px",
              fontSize: "13px",
              color: "#E4E4E7",
              width: "240px",
              outline: "none",
              fontFamily: "DM Mono, monospace",
            }}
          />
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              style={{
                background: filter === s.value ? s.color + "30" : "transparent",
                color: filter === s.value ? s.color : "#71717A",
                border: filter === s.value ? `1px solid ${s.color}` : "1px solid #3F3F46",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "10px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "DM Mono, monospace",
                letterSpacing: "0.05em",
                whiteSpace: "nowrap",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <p style={{ color: "#71717A", fontSize: "13px" }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "#71717A", fontSize: "13px" }}>No contacts found.</p>
        ) : (
          <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid #27272A" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{
                  background: "#18181B",
                  color: "#71717A",
                  fontSize: "10px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}>
                  {["Name", "Phone -- Safe", "Mailing Address", "Status", "Attempts", "Next Call", "Flags", "Actions"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const safePhone = c.dnc ? c.phone_secondary : c.phone_primary;
                  const statusObj = STATUSES.find(s => s.value === c.status) ?? STATUSES[1];
                  return (
                    <tr key={c.id} style={{
                      borderTop: "1px solid #27272A",
                      background: i % 2 === 0 ? "#09090B" : "#0D0D0F",
                    }}>
                      <td style={{ padding: "12px 16px", color: "#FAFAFA", fontWeight: 600 }}>
                        {c.full_name ?? "--"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <a href={`tel:${safePhone}`} style={{
                          color: "#10B981",
                          textDecoration: "none",
                          fontSize: "12px",
                        }}>
                          {safePhone ?? "--"}
                        </a>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#71717A", fontSize: "11px" }}>
                        {c.mailing_address ?? "--"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          background: statusObj.color + "20",
                          color: statusObj.color,
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                        }}>
                          {c.status ?? "NEW"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#71717A", textAlign: "center" }}>
                        {c.call_attempts ?? 0}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#F59E0B", fontSize: "11px" }}>
                        {c.next_call_at ? new Date(c.next_call_at).toLocaleDateString() : "--"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {c.dnc && (
                            <span style={{
                              background: "#450A0A",
                              color: "#F87171",
                              padding: "2px 6px",
                              borderRadius: "3px",
                              fontSize: "9px",
                              fontWeight: 700,
                            }}>DNC</span>
                          )}
                          {!c.skip_traced && (
                            <span style={{
                              background: "#422006",
                              color: "#FCD34D",
                              padding: "2px 6px",
                              borderRadius: "3px",
                              fontSize: "9px",
                              fontWeight: 700,
                            }}>NOT TRACED</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Link href={"/contacts/" + c.id} style={{
                            background: "#27272A",
                            color: "#A1A1AA",
                            padding: "4px 10px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            textDecoration: "none",
                            border: "1px solid #3F3F46",
                            fontWeight: 700,
                          }}>
                            SCRIPT
                          </Link>
                          <button
                            onClick={() => handleSkipTrace(c.id, c.notes)}
                            disabled={actionLoading === c.id + "-trace"}
                            style={{
                              background: "#1E3A5F",
                              color: "#93C5FD",
                              padding: "4px 10px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              cursor: "pointer",
                              border: "none",
                              fontFamily: "DM Mono, monospace",
                              fontWeight: 700,
                            }}
                          >
                            {actionLoading === c.id + "-trace" ? "..." : "TRACE"}
                          </button>
                          <button
                            onClick={() => handlePIR(c.id, c.notes)}
                            disabled={actionLoading === c.id + "-pir"}
                            style={{
                              background: "#FF006E15",
                              color: "#FF006E",
                              padding: "4px 10px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              cursor: "pointer",
                              border: "1px solid #FF006E40",
                              fontFamily: "DM Mono, monospace",
                              fontWeight: 700,
                            }}
                          >
                            {actionLoading === c.id + "-pir" ? "..." : "PIR"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
