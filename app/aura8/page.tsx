"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import ContentGate from "../components/content-gate";

const CRUSHON_LINK = "https://crushon.ai/?ref=mtk1mdd&mist=1";

const REVENUE_STREAMS = [
  { id: "subscription", label: "Subscriptions", status: "BUILDING", color: "#FF006E", desc: "Pro $7.99/mo. Solace8 $9.99/mo. Boomer-first design. Discreet billing." },
  { id: "affiliate", label: "Affiliate Commissions", status: "ACTIVE", color: "#FF5BB5", desc: "CrushOn AI -- 30% recurring commission. Live now." },
  { id: "ad", label: "Ad Network RPM", status: "PLANNED", color: "#C77DFF", desc: "ExoClick / JuicyAds. Premium Boomer CPM $8-25." },
  { id: "token", label: "Token Economy", status: "PLANNED", color: "#F59E0B", desc: "100 tokens $9.99. 500 tokens $39.99. Premium unlocks." },
  { id: "whitelabel", label: "White Label Platform", status: "PLANNED", color: "#00B4D8", desc: "License Aura8 stack to operators. $2K-10K/mo per operator." },
  { id: "data", label: "Anonymized Insights", status: "PLANNED", color: "#22C55E", desc: "Aggregated Boomer demographic data. CCPA compliant." },
];

const TIERS = [
  { id: "free", label: "Free", price: "$0", color: "#71717A", features: ["60-90 second previews", "Watermarked content", "Email capture only", "7-day Pro trial"] },
  { id: "pro", label: "Pro", price: "$7.99", color: "#FF006E", features: ["Full videos", "No watermark", "Download access", "AI recommendations"] },
  { id: "solace8", label: "Solace8", price: "$9.99", color: "#C77DFF", features: ["Everything in Pro", "CrushOn AI companion", "Personalized curation", "Discreet billing: SOLACE MEDIA"] },
];

const COMPLIANCE = [
  { item: "CCBill payment processing application", status: "PENDING", priority: "CRITICAL" },
  { item: "Age verification -- email + self-attestation", status: "ACTIVE", priority: "CRITICAL" },
  { item: "2257 Records Custodian -- Daniel Osazee Ebuehi", status: "ACTIVE", priority: "CRITICAL" },
  { item: "DMCA Agent Registration (copyright.gov)", status: "DONE", priority: "HIGH" },
  { item: "Email verification gate -- live integration", status: "ACTIVE", priority: "HIGH" },
  { item: "AWEmpire / AdultForce affiliate program", status: "PENDING", priority: "MEDIUM" },
  { item: "PornHub channel -- traffic funnel", status: "PENDING", priority: "MEDIUM" },
  { item: "Discreet billing descriptor -- SOLACE MEDIA", status: "PENDING", priority: "HIGH" },
];

const LENSES = [
  { id: "discovery", label: "Discovery", color: "#FF006E", desc: "AI-curated content feed. Guardian scraper. Verified sources only. Free tier access." },
  { id: "premium", label: "Premium", color: "#C77DFF", desc: "Full library. Pro + Solace8 tiers. CCBill-gated. Discreet billing." },
  { id: "forge", label: "Forge", color: "#F59E0B", desc: "AI creator tools. Custom content generation. Token economy. Phase 2." },
];

function Aura8Content() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeLens, setActiveLens] = useState("discovery");

  return (
    <div style={{ minHeight: "100vh", background: "#060608", color: "#E8E8F0", fontFamily: "DM Mono, monospace" }}>
      <div style={{ background: "#0D0D0F", borderBottom: "1px solid #FF006E30", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "14px", fontWeight: 800, color: "#FF006E", letterSpacing: "0.1em" }}>AURA8</div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["overview", "tiers", "lenses", "revenue", "compliance"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: activeTab === tab ? "#FF006E20" : "transparent", border: activeTab === tab ? "1px solid #FF006E" : "1px solid transparent", borderRadius: "4px", padding: "6px 12px", color: activeTab === tab ? "#FF006E" : "#71717A", fontSize: "10px", fontWeight: 700, cursor: "pointer", fontFamily: "DM Mono, monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto" }}>
        {activeTab === "overview" && (
          <div>
            <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.15em", marginBottom: "8px" }}>PLATFORM THESIS</div>
            <p style={{ fontSize: "13px", color: "#9A9A9F", lineHeight: 1.8, marginBottom: "24px" }}>
              Aura8 targets the underserved Boomer demographic (60-78) in the global adult content market ($100B+). Three core values: Privacy. Discretion. Cognitive and Emotional Utility. The loneliness economy drives willingness to pay -- AI companionship addresses a deeper need than content alone. Identity: Dosa. Domain: aura8.fun.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
              {[
                { label: "Market Size", value: "$100B+" },
                { label: "CAGR", value: "9.43%" },
                { label: "Target Demo", value: "Boomer" },
                { label: "Revenue Streams", value: "6" },
                { label: "Payment Rails", value: "3" },
                { label: "Status", value: "LIVE" },
              ].map(m => (
                <div key={m.label} style={{ background: "#0D0D0F", border: "1px solid #1A1A2E", borderRadius: "6px", padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "9px", color: "#52525B", letterSpacing: "0.1em", marginBottom: "4px" }}>{m.label}</div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#FF006E" }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#0D0D0F", border: "1px solid #FF006E20", borderRadius: "8px", padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.2em", marginBottom: "8px" }}>EXPLORE NOW -- AFFILIATE</div>
              <p style={{ fontSize: "12px", color: "#71717A", marginBottom: "16px" }}>Experience AI companionship now through our CrushOn AI partnership. Private, intelligent, available immediately.</p>
              <a href={CRUSHON_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", border: "1px solid #FF006E", borderRadius: "4px", padding: "10px 24px", color: "#FF006E", fontSize: "11px", fontWeight: 700, textDecoration: "none", letterSpacing: "0.08em" }}>
                EXPLORE CRUSHON AI
              </a>
              <p style={{ fontSize: "9px", color: "#3F3F46", marginTop: "8px" }}>Affiliate partnership. Aura8 earns 30% recurring commission.</p>
            </div>
          </div>
        )}

        {activeTab === "tiers" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            {TIERS.map(t => (
              <div key={t.id} style={{ background: "#0D0D0F", border: "1px solid " + t.color + "40", borderRadius: "8px", padding: "24px" }}>
                <div style={{ fontSize: "10px", color: t.color, letterSpacing: "0.15em", marginBottom: "8px" }}>{t.label.toUpperCase()}</div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: t.color, marginBottom: "16px" }}>{t.price}</div>
                {t.features.map(f => (
                  <div key={f} style={{ fontSize: "11px", color: "#71717A", marginBottom: "6px", paddingLeft: "8px", borderLeft: "2px solid " + t.color + "40" }}>{f}</div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === "lenses" && (
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              {LENSES.map(l => (
                <button key={l.id} onClick={() => setActiveLens(l.id)} style={{ background: activeLens === l.id ? l.color + "20" : "transparent", border: activeLens === l.id ? "1px solid " + l.color : "1px solid #1A1A2E", borderRadius: "4px", padding: "8px 16px", color: activeLens === l.id ? l.color : "#71717A", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "DM Mono, monospace" }}>
                  {l.label.toUpperCase()}
                </button>
              ))}
            </div>
            {LENSES.filter(l => l.id === activeLens).map(l => (
              <div key={l.id} style={{ background: "#0D0D0F", border: "1px solid " + l.color + "30", borderRadius: "8px", padding: "24px" }}>
                <div style={{ fontSize: "13px", color: "#9A9A9F", lineHeight: 1.8 }}>{l.desc}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "revenue" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {REVENUE_STREAMS.map(r => (
              <div key={r.id} style={{ background: "#0D0D0F", border: "1px solid #1A1A2E", borderRadius: "6px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#FAFAFA", marginBottom: "4px" }}>{r.label}</div>
                  <div style={{ fontSize: "11px", color: "#71717A" }}>{r.desc}</div>
                </div>
                <div style={{ background: r.color + "20", color: r.color, fontSize: "9px", fontWeight: 700, padding: "4px 8px", borderRadius: "4px", whiteSpace: "nowrap", marginLeft: "16px" }}>{r.status}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "compliance" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {COMPLIANCE.map((c, i) => (
              <div key={i} style={{ background: "#0D0D0F", border: "1px solid #1A1A2E", borderRadius: "6px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "12px", color: "#9A9A9F" }}>{c.item}</div>
                <div style={{ display: "flex", gap: "8px", flexShrink: 0, marginLeft: "16px" }}>
                  <span style={{ fontSize: "9px", color: c.priority === "CRITICAL" ? "#EF4444" : c.priority === "HIGH" ? "#F59E0B" : "#71717A", fontWeight: 700 }}>{c.priority}</span>
                  <span style={{ fontSize: "9px", color: c.status === "DONE" || c.status === "ACTIVE" ? "#10B981" : "#F59E0B", fontWeight: 700 }}>{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: "#0D0D0F", borderTop: "1px solid #1A1A2E", padding: "20px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "9px", color: "#3F3F46", letterSpacing: "0.1em" }}>
          AURA8 -- SMILING BUBBLES INC. -- ADULTS 18+ ONLY --{" "}
          <a href="/aura8/privacy" style={{ color: "#52525B", textDecoration: "none" }}>PRIVACY</a>
          {" "}--{" "}
          <a href="/aura8/terms" style={{ color: "#52525B", textDecoration: "none" }}>TERMS</a>
          {" "}--{" "}
          <a href="/aura8/acceptable-use" style={{ color: "#52525B", textDecoration: "none" }}>ACCEPTABLE USE</a>
        </div>
      </div>
    </div>
  );
}

export default function Aura8Page() {
  return (
    <ContentGate>
      <Aura8Content />
    </ContentGate>
  );
}
