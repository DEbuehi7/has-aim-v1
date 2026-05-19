"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";

const STATUS_COLORS = {
  NEW:           { bg: "#3F3F46", color: "#E4E4E7" },
  CALLED:        { bg: "#1E3A5F", color: "#93C5FD" },
  VOICEMAIL:     { bg: "#4A3000", color: "#FCD34D" },
  CALLBACK:      { bg: "#3B1F6B", color: "#C4B5FD" },
  INTERESTED:    { bg: "#14532D", color: "#86EFAC" },
  NOT_INTERESTED:{ bg: "#4C0519", color: "#FCA5A5" },
  DNC:           { bg: "#450A0A", color: "#F87171" },
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/contacts")
      .then(r => r.json())
      .then(d => { setContacts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = contacts.filter(c => {
    const matchSearch =
      (c.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.phone_primary ?? "").includes(search);
    const matchFilter = filter === "ALL" || c.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#09090B", color: "#E4E4E7", padding: "24px", fontFamily: "DM Mono, monospace" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#FAFAFA", letterSpacing: "-0.02em" }}>Contacts</h1>
          <span style={{ fontSize: "12px", color: "#71717A" }}>{filtered.length} records</span>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or phone..."
            style={{ background: "#27272A", border: "1px solid #3F3F46", borderRadius: "6px", padding: "8px 12px", fontSize: "13px", color: "#E4E4E7", width: "240px", outline: "none" }}
          />
          {["ALL","NEW","CALLED","VOICEMAIL","CALLBACK","INTERESTED","NOT_INTERESTED","DNC"].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                background: filter === s ? "#FAFAFA" : "#27272A",
                color: filter === s ? "#09090B" : "#A1A1AA",
                border: "1px solid " + (filter === s ? "#FAFAFA" : "#3F3F46"),
                borderRadius: "6px", padding: "8px 12px",
                fontSize: "11px", cursor: "pointer", fontFamily: "DM Mono, monospace",
                letterSpacing: "0.05em",
              }}
            >{s}</button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: "#71717A", fontSize: "13px" }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "#71717A", fontSize: "13px" }}>No contacts found.</p>
        ) : (
          <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid #27272A" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#18181B", color: "#71717A", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {["Name","Phone","Email","Role","Status","Calls","Flags","Action"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} style={{ borderTop: "1px solid #27272A", background: i % 2 === 0 ? "#09090B" : "#0D0D0F" }}>
                    <td style={{ padding: "12px 16px", color: "#FAFAFA", fontWeight: 600 }}>{c.full_name ?? "--"}</td>
                    <td style={{ padding: "12px 16px", color: "#A1A1AA" }}>{c.phone_primary ?? "--"}</td>
                    <td style={{ padding: "12px 16px", color: "#71717A" }}>{c.email ?? "--"}</td>
                    <td style={{ padding: "12px 16px", color: "#71717A", textTransform: "capitalize" }}>{(c.role ?? "--").toLowerCase()}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        background: (STATUS_COLORS[c.status] ?? STATUS_COLORS.NEW).bg,
                        color: (STATUS_COLORS[c.status] ?? STATUS_COLORS.NEW).color,
                        padding: "3px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 600,
                      }}>{c.status ?? "NEW"}</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#71717A" }}>{c.call_attempts ?? 0}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {c.dnc && <span style={{ background: "#450A0A", color: "#F87171", padding: "2px 6px", borderRadius: "3px", fontSize: "10px", marginRight: "4px" }}>DNC</span>}
                      {!c.skip_traced && <span style={{ background: "#422006", color: "#FCD34D", padding: "2px 6px", borderRadius: "3px", fontSize: "10px" }}>NOT TRACED</span>}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Link href={"/contacts/" + c.id} style={{
                        background: "#27272A", color: "#A1A1AA", padding: "4px 10px",
                        borderRadius: "4px", fontSize: "11px", textDecoration: "none",
                        border: "1px solid #3F3F46",
                      }}>Call Script</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}