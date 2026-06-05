"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";

const STATUSES = [
  { label: "ALL", value: "ALL", color: "#71717A" },
  { label: "NEW", value: "NEW", color: "#71717A" },
  { label: "NO ANSWER", value: "called_no_answer", color: "#52525B" },
  { label: "NOT INTERESTED", value: "called_not_interested", color: "#EF4444" },
  { label: "CALLBACK", value: "callback_requested", color: "#F59E0B" },
  { label: "CONVERSATION", value: "conversation_had", color: "#3B82F6" },
  { label: "MOTIVATED", value: "motivated", color: "#10B981" },
  { label: "UNDER CONTRACT", value: "under_contract", color: "#8B5CF6" },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchContacts = async () => {
    const res = await fetch("/api/has/contacts/list");
    const data = await res.json();
    setContacts(data.contacts ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchContacts(); }, []);

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
