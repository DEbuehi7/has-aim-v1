"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";

const REVENUE_STREAMS = [
{ id: "ad",        label: "Ad Network RPM",       status: "PLANNED",  color: "#FF006E", desc: "ExoClick / JuicyAds. RPM-based display ads. No subscription required." },
{ id: "affiliate", label: "Affiliate Commissions", status: "PLANNED",  color: "#FF5BB5", desc: "Lifetime commission structure. Candy AI + CrushOn AI affiliate programs." },
{ id: "stripe",    label: "Stripe Membership",     status: "BUILDING", color: "#C77DFF", desc: "Tiered subscription. $9.99/mo or $79.99 lifetime. Boomer demographic." },
{ id: "telegram",  label: "Telegram Premium",      status: "PLANNED",  color: "#00B4D8", desc: "Private premium channel. Herald Bot. Exclusive content drops." },
{ id: "sponsored", label: "Sponsored Nodes",       status: "PLANNED",  color: "#F59E0B", desc: "Creator node sponsorship packages. Featured placement in Kinetic Grid." },
{ id: "forge",     label: "Forge -- Creator Tools",  status: "PLANNED",  color: "#22C55E", desc: "AI creator toolkit. Proprietary Boomer personas. Phase 2 revenue engine." },
];

const STATUS_COLORS = {
PLANNED:  "#4A4A4E",
BUILDING: "#F59E0B",
ACTIVE:   "#22C55E",
};

const LENSES = [
{ id: "discovery", label: "Discovery", color: "#FF006E", desc: "Curated content feed. Guardian AI scraper. Verified sources only. Powered by CrushOn AI." },
{ id: "premium",   label: "Premium",   color: "#C77DFF", desc: "Subscription-gated content. Stripe-protected. Age-verified users only." },
{ id: "forge",     label: "Forge",     color: "#F59E0B", desc: "AI creator tools. Generate, publish, monetize. Proprietary persona engine." },
];

const COMPLIANCE = [
{ item: "Age Verification (Veriff/AgeID)", status: "PENDING", priority: "CRITICAL" },
{ item: "DMCA Agent Registration (copyright.gov)", status: "PENDING", priority: "HIGH" },
{ item: "Three-Leg Payment Rail (Stripe + Telegram Stars + Coinbase)", status: "PARTIAL", priority: "HIGH" },
{ item: "Privacy Policy + Terms of Service", status: "PENDING", priority: "HIGH" },
{ item: "CA AB 2257 Compliance Review", status: "PENDING", priority: "CRITICAL" },
{ item: "Reddit Niche Staking (r/BoomerEntertainment)", status: "PENDING", priority: "MEDIUM" },
{ item: "Telegram Channel Launch", status: "PENDING", priority: "MEDIUM" },
];

export default function Aura8Page() {
const [activeTab, setActiveTab] = useState("overview");
const [activeLens, setActiveLens] = useState("discovery");
const [ageConfirmed, setAgeConfirmed] = useState(false);

if (!ageConfirmed) {
return (
<div style={{ minHeight: "100vh", background: "#060608", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Mono, monospace" }}>
<div style={{ background: "#0D0D0F", border: "1px solid #FF006E40", borderRadius: "8px", padding: "40px", maxWidth: "400px", textAlign: "center" }}>
<div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.2em", marginBottom: "16px" }}>AURA8</div>
<div style={{ fontSize: "20px", fontWeight: 800, color: "#FFF", marginBottom: "8px" }}>Age Verification Required</div>
<div style={{ fontSize: "11px", color: "#666", lineHeight: 1.7, marginBottom: "24px" }}>
This platform contains adult content. You must be 18 or older to enter. By continuing you confirm you are of legal age in your jurisdiction.
</div>
<div style={{ fontSize: "9px", color: "#444", marginBottom: "20px" }}>
Full age verification (Veriff/AgeID) coming soon. This is a pre-launch shell.
</div>
<button
onClick={() => setAgeConfirmed(true)}
style={{ background: "#FF006E", border: "none", borderRadius: "4px", padding: "12px 32px", color: "#FFF", fontSize: "11px", letterSpacing: "0.1em", cursor: "pointer", fontFamily: "DM Mono, monospace", width: "100%", marginBottom: "8px" }}
>
I AM 18 OR OLDER -- ENTER
</button>
<button
onClick={() => window.location.href = "/dashboard"}
style={{ background: "transparent", border: "1px solid #252528", borderRadius: "4px", padding: "12px 32px", color: "#555", fontSize: "11px", letterSpacing: "0.1em", cursor: "pointer", fontFamily: "DM Mono, monospace", width: "100%" }}
>
EXIT
</button>
</div>
</div>
);
}

return (
<div style={{ minHeight: "100vh", background: "#060608", color: "#E8E8F0", fontFamily: "DM Mono, monospace" }}>

  <div style={{ background: "#0D0D0F", borderBottom: "1px solid #FF006E30", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div>
      <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#FF006E", marginBottom: "4px" }}>AURA8 -- DOSA PROTOCOL</div>
      <div style={{ fontSize: "20px", fontWeight: 800, color: "#FFF" }}>AI ADULT PLATFORM</div>
    </div>
    <div style={{ fontSize: "9px", color: "#333", letterSpacing: "0.15em", textAlign: "right" }}>
      <div>SBI CAPITAL</div>
      <div style={{ color: "#FF006E" }}>PRE-LAUNCH</div>
    </div>
  </div>

  <div style={{ borderBottom: "1px solid #1A1A2E", display: "flex", overflowX: "auto" }}>
    {["overview", "lenses", "revenue", "compliance"].map(tab => (
      <button key={tab} onClick={() => setActiveTab(tab)} style={{
        background: "transparent", border: "none",
        borderBottom: "2px solid " + (activeTab === tab ? "#FF006E" : "transparent"),
        padding: "12px 20px", cursor: "pointer", fontSize: "9px",
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: activeTab === tab ? "#FF006E" : "#555",
        fontFamily: "DM Mono, monospace", whiteSpace: "nowrap",
      }}>{tab}</button>
    ))}
  </div>

  <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>

    {activeTab === "overview" && (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ background: "#0D0D0F", border: "1px solid #FF006E30", borderRadius: "8px", padding: "20px" }}>
          <div style={{ fontSize: "9px", color: "#FF006E", letterSpacing: "0.2em", marginBottom: "8px" }}>PLATFORM THESIS</div>
          <div style={{ fontSize: "13px", color: "#CCC", lineHeight: 1.8 }}>
            Aura8 targets the underserved Boomer demographic (60-78) in the global adult content market ($61.96B, 9.43% CAGR to 2031). Three core values: Privacy, Discretion, Cognitive and Emotional Utility. Identity: Dosa. Domain: Aura8.fun.
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
          {[
            { label: "Market Size", value: "$61.96B", color: "#FF006E" },
            { label: "CAGR", value: "9.43%", color: "#FF5BB5" },
            { label: "Target Demo", value: "Boomer", color: "#C77DFF" },
            { label: "Revenue Streams", value: "6", color: "#F59E0B" },
            { label: "Payment Rails", value: "3", color: "#22C55E" },
            { label: "Status", value: "PRE-LAUNCH", color: "#FF006E" },
          ].map(s => (
            <div key={s.label} style={{ background: "#0D0D0F", border: "1px solid #1A1A2E", borderRadius: "4px", padding: "12px" }}>
              <div style={{ fontSize: "8px", color: "#444", letterSpacing: "0.12em", marginBottom: "4px" }}>{s.label}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#0D0D0F", border: "1px solid #1A1A2E", borderRadius: "8px", padding: "20px" }}>
          <div style={{ fontSize: "9px", color: "#555", letterSpacing: "0.2em", marginBottom: "12px" }}>PRE-LAUNCH CHECKLIST</div>
          {[
            { item: "Age verification provider selected", done: false },
            { item: "DMCA agent registered at copyright.gov", done: true },
            { item: "Stripe account connected", done: false },
            { item: "Telegram channel created", done: false },
            { item: "Candy AI affiliate signed up", done: false },
            { item: "Reddit niche staked", done: false },
            { item: "Aura8.fun domain configured", done: false },
          ].map((c, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #141416" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: c.done ? "#22C55E" : "#252528", flexShrink: 0 }} />
              <span style={{ fontSize: "11px", color: c.done ? "#22C55E" : "#666" }}>{c.item}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {activeTab === "lenses" && (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {LENSES.map(l => (
            <button key={l.id} onClick={() => setActiveLens(l.id)} style={{
              background: activeLens === l.id ? l.color + "20" : "#0D0D0F",
              border: "1px solid " + (activeLens === l.id ? l.color : "#1A1A2E"),
              borderRadius: "6px", padding: "12px 20px", cursor: "pointer",
              color: activeLens === l.id ? l.color : "#555",
              fontSize: "10px", letterSpacing: "0.12em", fontFamily: "DM Mono, monospace",
            }}>{l.label}</button>
          ))}
        </div>
        {LENSES.filter(l => l.id === activeLens).map(l => (
          <div key={l.id} style={{ background: "#0D0D0F", border: "1px solid " + l.color + "30", borderRadius: "8px", padding: "24px" }}>
            <div style={{ fontSize: "9px", color: l.color, letterSpacing: "0.2em", marginBottom: "8px" }}>{l.label.toUpperCase()} LENS</div>
            <div style={{ fontSize: "13px", color: "#CCC", lineHeight: 1.8, marginBottom: "20px" }}>{l.desc}</div>
            <div style={{ background: "#141416", borderRadius: "4px", padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#444" }}>
                {l.id === "discovery" ? "Guardian AI scraper -- coming Sprint 6" :
                 l.id === "premium" ? "Stripe + age verification required before launch" :
                 "Proprietary persona engine -- Phase 2"}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {activeTab === "revenue" && (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.15em", marginBottom: "4px" }}>6 REVENUE STREAMS</div>
        {REVENUE_STREAMS.map(s => (
          <div key={s.id} style={{ background: "#0D0D0F", border: "1px solid #1A1A2E", borderLeft: "3px solid " + s.color, borderRadius: "4px", padding: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "11px", color: "#FFF", fontWeight: 700 }}>{s.label}</span>
              <span style={{ fontSize: "9px", color: STATUS_COLORS[s.status] ?? "#555", letterSpacing: "0.1em" }}>{s.status}</span>
            </div>
            <div style={{ fontSize: "10px", color: "#666", lineHeight: 1.6 }}>{s.desc}</div>
          </div>
        ))}
      </div>
    )}

    {activeTab === "compliance" && (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.15em", marginBottom: "4px" }}>COMPLIANCE GATES</div>
        <div style={{ background: "#0D0D0F", border: "1px solid #FF006E30", borderRadius: "4px", padding: "14px", marginBottom: "8px" }}>
          <div style={{ fontSize: "11px", color: "#FF006E", marginBottom: "4px" }}>CANONICAL RULE</div>
          <div style={{ fontSize: "10px", color: "#666", lineHeight: 1.6 }}>All compliance gates must be cleared before any content goes live. Age verification is non-negotiable. DMCA registration required before launch.</div>
        </div>
        {COMPLIANCE.map((c, i) => (
          <div key={i} style={{ background: "#0D0D0F", border: "1px solid #1A1A2E", borderLeft: "3px solid " + (c.priority === "CRITICAL" ? "#FF006E" : c.priority === "HIGH" ? "#F59E0B" : "#555"), borderRadius: "4px", padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "#CCC" }}>{c.item}</span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                <span style={{ fontSize: "8px", color: c.priority === "CRITICAL" ? "#FF006E" : c.priority === "HIGH" ? "#F59E0B" : "#555", letterSpacing: "0.1em" }}>{c.priority}</span>
                <span style={{ fontSize: "8px", color: c.status === "PARTIAL" ? "#F59E0B" : "#444", letterSpacing: "0.1em" }}>{c.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

  </div>
</div>

);
}