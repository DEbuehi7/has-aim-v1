"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

const STAGES = ["ALL", "NEW", "ANALYZING", "OFFER", "UNDER_CONTRACT", "CLOSED", "DEAD"];

const STAGE_COLORS = {
  NEW:            { bg: "#27272A", color: "#A1A1AA" },
  ANALYZING:      { bg: "#1E3A5F", color: "#93C5FD" },
  OFFER:          { bg: "#4A3000", color: "#FCD34D" },
  UNDER_CONTRACT: { bg: "#3B1F6B", color: "#C4B5FD" },
  CLOSED:         { bg: "#14532D", color: "#86EFAC" },
  DEAD:           { bg: "#450A0A", color: "#F87171" },
};

export default function DealsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/deals")
      .then(r => r.json())
      .then(d => { setDeals(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = deals.filter(d => {
    const matchStage = stage === "ALL" || d.stage === stage;
    const matchSearch =
      (d.address ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (d.owner_name ?? "").toLowerCase().includes(search.toLowerCase());
    return matchStage && matchSearch;
  });

  const totalARV = filtered.reduce((sum, d) => sum + (d.arv ?? 0), 0);
  const totalOffer = filtered.reduce((sum, d) => sum + (d.offer_price ?? 0), 0);
  const activeCount = deals.filter(d => !["CLOSED","DEAD"].includes(d.stage)).length;

  return (
    <div style={{ minHeight: "100vh", background: "#09090B", color: "#E4E4E7", padding: "24px", fontFamily: "DM Mono, monospace" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#FAFAFA", letterSpacing: "-0.02em" }}>Deal Pipeline</h1>
          <span style={{ fontSize: "12px", color: "#71717A" }}>{filtered.length} deals</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
          {[
            { label: "Total ARV",    value: "$" + totalARV.toLocaleString(),   color: "#86EFAC" },
            { label: "Total Offers", value: "$" + totalOffer.toLocaleString(), color: "#93C5FD" },
            { label: "Active",       value: activeCount,                        color: "#FCD34D" },
          ].map(s => (
            <div key={s.label} style={{ background: "#18181B", border: "1px solid #27272A", borderRadius: "8px", padding: "16px" }}>
              <div style={{ fontSize: "10px", color: "#71717A", letterSpacing: "0.1em", marginBottom: "6px" }}>{s.label}</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search address or owner..."
            style={{ background: "#27272A", border: "1px solid #3F3F46", borderRadius: "6px", padding: "8px 12px", fontSize: "13px", color: "#E4E4E7", width: "220px", outline: "none" }}
          />
          {STAGES.map(s => (
            <button key={s} onClick={() => setStage(s)} style={{
              background: stage === s ? "#FAFAFA" : "#27272A",
              color: stage === s ? "#09090B" : "#A1A1AA",
              border: "1px solid " + (stage === s ? "#FAFAFA" : "#3F3F46"),
              borderRadius: "6px", padding: "6px 12px", fontSize: "11px",
              cursor: "pointer", fontFamily: "DM Mono, monospace",
            }}>{s}</button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: "#71717A", fontSize: "13px" }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "#71717A", fontSize: "13px" }}>No deals found.</p>
            <p style={{ color: "#52525B", fontSize: "11px", marginTop: "6px" }}>Add deals from the Sentinel lead pipeline.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid #27272A" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#18181B", color: "#71717A", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {["Address","Owner","Stage","ARV","Offer","Score","Zoning","Updated"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => {
                  const sc = STAGE_COLORS[d.stage] ?? STAGE_COLORS.NEW;
                  return (
                    <tr key={d.id} style={{ borderTop: "1px solid #27272A", background: i % 2 === 0 ? "#09090B" : "#0D0D0F" }}>
                      <td style={{ padding: "12px 16px", color: "#FAFAFA", fontWeight: 600 }}>{d.address ?? "--"}</td>
                      <td style={{ padding: "12px 16px", color: "#A1A1AA" }}>{d.owner_name ?? "--"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: sc.bg, color: sc.color, padding: "3px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 600 }}>
                          {d.stage ?? "NEW"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#86EFAC" }}>{d.arv ? "$" + d.arv.toLocaleString() : "--"}</td>
                      <td style={{ padding: "12px 16px", color: "#93C5FD" }}>{d.offer_price ? "$" + d.offer_price.toLocaleString() : "--"}</td>
                      <td style={{ padding: "12px 16px", color: (d.lead_score ?? 0) >= 70 ? "#86EFAC" : (d.lead_score ?? 0) >= 40 ? "#FCD34D" : "#F87171", fontWeight: 600 }}>
                        {d.lead_score ?? 0}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#71717A" }}>{d.zoning_code ?? "--"}</td>
                      <td style={{ padding: "12px 16px", color: "#52525B", fontSize: "11px" }}>
                        {d.updated_at ? new Date(d.updated_at).toLocaleDateString() : "--"}
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