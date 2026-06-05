"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";

const CRUSHON_LINK = "https://crushon.ai/?ref=mtk1mdd&mist=1";

const REVENUE_STREAMS = [
  { id: "subscription", label: "Subscriptions",        status: "BUILDING", color: "#FF006E", desc: "Pro $7.99/mo. Solace8 $9.99/mo. Boomer-first design. Discreet billing." },
  { id: "affiliate",   label: "Affiliate Commissions", status: "ACTIVE",   color: "#FF5BB5", desc: "CrushOn AI -- 30% recurring commission. Live now." },
  { id: "ad",          label: "Ad Network RPM",        status: "PLANNED",  color: "#C77DFF", desc: "ExoClick / JuicyAds. Premium Boomer CPM $8-25." },
  { id: "token",       label: "Token Economy",         status: "PLANNED",  color: "#F59E0B", desc: "100 tokens $9.99. 500 tokens $39.99. Premium unlocks." },
  { id: "whitelabel",  label: "White Label Platform",  status: "PLANNED",  color: "#00B4D8", desc: "License Aura8 stack to operators. $2K-10K/mo per operator." },
  { id: "data",        label: "Anonymized Insights",   status: "PLANNED",  color: "#22C55E", desc: "Aggregated Boomer demographic data. CCPA compliant." },
];

const TIERS = [
  { id: "free",    label: "Free",     price: "$0",     color: "#71717A", features: ["60-90 second previews", "Watermarked content", "Email capture only", "7-day Pro trial"] },
  { id: "pro",     label: "Pro",      price: "$7.99",  color: "#FF006E", features: ["Full videos", "No watermark", "Download access", "AI recommendations"] },
  { id: "solace8", label: "Solace8",  price: "$9.99",  color: "#C77DFF", features: ["Everything in Pro", "CrushOn AI companion", "Personalized curation", "Discreet billing: SOLACE MEDIA"] },
];

const COMPLIANCE = [
  { item: "CCBill payment processing application", status: "PENDING",  priority: "CRITICAL" },
  { item: "Age verification -- IP + timestamp logging", status: "ACTIVE", priority: "CRITICAL" },
  { item: "2257 Records Custodian -- Daniel Osazee Ebuehi", status: "ACTIVE", priority: "CRITICAL" },
  { item: "DMCA Agent Registration (copyright.gov)", status: "DONE",    priority: "HIGH" },
  { item: "Veriff age verification -- live integration", status: "PENDING", priority: "HIGH" },
  { item: "AWEmpire / AdultForce affiliate program", status: "PENDING", priority: "MEDIUM" },
  { item: "PornHub channel -- traffic funnel", status: "PENDING",       priority: "MEDIUM" },
  { item: "Discreet billing descriptor -- SOLACE MEDIA", status: "PENDING", priority: "HIGH" },
];

const LENSES = [
  { id: "discovery", label: "Discovery", color: "#FF006E", desc: "AI-curated content feed. Guardian scraper. Verified sources only. Free tier access." },
  { id: "premium",   label: "Premium",   color: "#C77DFF", desc: "Full library. Pro + Solace8 tiers. CCBill-gated. Discreet billing." },
  { id: "forge",     label: "Forge",     color: "#F59E0B", desc: "AI creator tools. Custom content generation. Token economy. Phase 2." },
];

export default function Aura8Page() {
  const [activeTab, setActiveTab]     = useState("overview");
  const [activeLens, setActiveLens]   = useState("discovery");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [verifying, setVerifying]     = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);

  const handleAgeConfirm = async () => {
    setVerifying(true);
    try {
      await fetch("/api/aura8/age-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          confirmed: true,
        }),
      });
    } catch (e) {
      console.error("Age verify log failed:", e);
    }
    setVerifying(false);
    setAgeConfirmed(true);
  };

  if (!ageConfirmed) {
    return (
      <div style={{ minHeight: "100vh", background: "#060608", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Mono, monospace", padding: "24px" }}>
        <div style={{ background: "#0D0D0F", border: "1px solid #FF006E40", borderRadius: "8px", padding: "40px", maxWidth: "420px", width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.2em", marginBottom: "16px" }}>AURA8 -- DOSA PROTOCOL</div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#FFF", marginBottom: "12px" }}>Age Verification Required</div>
          <div style={{ fontSize: "12px", color: "#666", lineHeight: 1.8, marginBottom: "16px" }}>
            This platform contains adult content intended for users 18 years of age or older. By entering you confirm you are of legal age in your jurisdiction.
          </div>
          <div style={{ background: "#141416", border: "1px solid #252528", borderRadius: "4px", padding: "12px", marginBottom: "20px", fontSize: "10px", color: "#444", lineHeight: 1.6 }}>
            Your IP address and confirmation timestamp are logged for compliance purposes per 18 U.S.C. § 2257. Records Custodian: Daniel Osazee Ebuehi, 300 West Valley Blvd #3018, Alhambra CA 91803.
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "16px", textAlign: "left" }}>
            <input
              type="checkbox"
              id="tos"
              checked={tosAccepted}
              onChange={e => setTosAccepted(e.target.checked)}
              style={{ marginTop: "2px", accentColor: "#FF006E", cursor: "pointer", flexShrink: 0 }}
            />
            <label htmlFor="tos" style={{ fontSize: "11px", color: "#71717A", lineHeight: 1.7, cursor: "pointer" }}>
              I confirm I am 18 or older and agree to the{" "}
              <a href="/aura8/terms" style={{ color: "#FF006E", textDecoration: "none" }}>Terms of Service</a>
              {", "}
              <a href="/aura8/privacy" style={{ color: "#FF006E", textDecoration: "none" }}>Privacy Policy</a>
              {", and "}
              <a href="/aura8/acceptable-use" style={{ color: "#FF006E", textDecoration: "none" }}>Acceptable Use Policy</a>
            </label>
          </div>
          <button
            onClick={handleAgeConfirm}
            disabled={verifying}
            style={{ background: "#FF006E", border: "none", borderRadius: "4px", padding: "14px 32px", color: "#FFF", fontSize: "12px", fontWeight: 700, cursor: verifying ? "not-allowed" : "pointer", fontFamily: "DM Mono, monospace", width: "100%", marginBottom: "10px", letterSpacing: "0.08em" }}
          >
            {verifying ? "VERIFYING..." : "I AM 18 OR OLDER -- ENTER"}
          </button>
          <button
            onClick={() => window.location.href = "/dashboard"}
            style={{ background: "transparent", border: "1px solid #252528", borderRadius: "4px", padding: "14px 32px", color: "#555", fontSize: "12px", cursor: "pointer", fontFamily: "DM Mono, monospace", width: "100%", letterSpacing: "0.08em" }}
          >
            EXIT
          </button>
          <div style={{ fontSize: "9px", color: "#333", marginTop: "16px" }}>
            Full Veriff age verification coming soon. Pre-launch shell.
          </div>
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
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "9px", color: "#333", letterSpacing: "0.12em" }}>SBI CAPITAL</div>
          <div style={{ fontSize: "9px", color: "#FF006E", letterSpacing: "0.12em" }}>PRE-LAUNCH</div>
        </div>
      </div>

      <div style={{ borderBottom: "1px solid #1A1A2E", display: "flex", overflowX: "auto" }}>
        {["overview", "tiers", "lenses", "revenue", "compliance"].map(tab => (
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
                Aura8 targets the underserved Boomer demographic (60-78) in the global adult content market ($100B+). Three core values: Privacy. Discretion. Cognitive and Emotional Utility. The loneliness economy drives willingness to pay -- AI companionship addresses a deeper need than content alone. Identity: Dosa. Domain: aura8.fun.
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {[
                { label: "Market Size",    value: "$100B+",   color: "#FF006E" },
                { label: "CAGR",           value: "9.43%",    color: "#FF5BB5" },
                { label: "Target Demo",    value: "Boomer",   color: "#C77DFF" },
                { label: "Revenue Streams",value: "6",        color: "#F59E0B" },
                { label: "Payment Rails",  value: "3",        color: "#22C55E" },
                { label: "Status",         value: "PRE-LAUNCH", color: "#FF006E" },
              ].map(s => (
                <div key={s.label} style={{ background: "#0D0D0F", border: "1px solid #1A1A2E", borderRadius: "4px", padding: "12px" }}>
                  <div style={{ fontSize: "8px", color: "#444", letterSpacing: "0.12em", marginBottom: "4px" }}>{s.label}</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#0D0D0F", border: "1px solid #FF006E20", borderRadius: "8px", padding: "20px" }}>
              <div style={{ fontSize: "9px", color: "#FF006E", letterSpacing: "0.2em", marginBottom: "12px" }}>EXPLORE NOW -- AFFILIATE</div>
              <div style={{ fontSize: "12px", color: "#9A9A9F", lineHeight: 1.7, marginBottom: "16px" }}>
                Experience AI companionship now through our CrushOn AI partnership. Private, intelligent, available immediately.
              </div>
              <a href={CRUSHON_LINK} target="_blank" rel="noopener noreferrer" style={{
                display: "block", background: "transparent", border: "1px solid #FF006E",
                borderRadius: "4px", padding: "12px 24px", color: "#FF006E",
                fontSize: "11px", fontWeight: 700, textDecoration: "none",
                letterSpacing: "0.08em", textAlign: "center",
              }}>
                EXPLORE CRUSHON AI →
              </a>
              <div style={{ fontSize: "9px", color: "#3F3F46", marginTop: "8px", textAlign: "center" }}>
                Affiliate partnership. Aura8 earns 30% recurring commission.
              </div>
            </div>
          </div>
        )}

        {activeTab === "tiers" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.15em" }}>SUBSCRIPTION TIERS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
              {TIERS.map(t => (
                <div key={t.id} style={{ background: "#0D0D0F", border: "1px solid " + t.color + "40", borderTop: "3px solid " + t.color, borderRadius: "8px", padding: "20px" }}>
                  <div style={{ fontSize: "9px", color: t.color, letterSpacing: "0.2em", marginBottom: "8px" }}>{t.label.toUpperCase()}</div>
                  <div style={{ fontSize: "26px", fontWeight: 900, color: "#FFF", marginBottom: "4px" }}>{t.price}</div>
                  <div style={{ fontSize: "9px", color: "#555", marginBottom: "16px" }}>per month</div>
                  {t.features.map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "6px" }}>
                      <span style={{ color: t.color, fontSize: "10px", marginTop: "1px" }}>✓</span>
                      <span style={{ fontSize: "11px", color: "#9A9A9F" }}>{f}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ background: "#0D0D0F", border: "1px solid #252528", borderRadius: "4px", padding: "14px", fontSize: "10px", color: "#555", lineHeight: 1.6 }}>
              Payment processing via CCBill (pending approval). Billing descriptor: SOLACE MEDIA. Discreet. No Aura8 branding on statements.
            </div>
          </div>
        )}

        {activeTab === "lenses" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {LENSES.map(l => (
                <button key={l.id} onClick={() => setActiveLens(l.id)} style={{
                  background: activeLens === l.id ? l.color + "20" : "#0D0D0F",
                  border: "1px solid " + (activeLens === l.id ? l.color : "#1A1A2E"),
                  borderRadius: "6px", padding: "10px 18px", cursor: "pointer",
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
                    {l.id === "discovery" ? "AI curation pipeline -- n8n + Guardian scraper -- Sprint 6" :
                     l.id === "premium"   ? "CCBill integration required before launch" :
                     "Token economy -- Phase 2 build"}
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
                  <span style={{ fontSize: "9px", color: s.status === "ACTIVE" ? "#22C55E" : s.status === "BUILDING" ? "#F59E0B" : "#4A4A4E", letterSpacing: "0.1em" }}>{s.status}</span>
                </div>
                <div style={{ fontSize: "10px", color: "#666", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
            <div style={{ background: "#0D0D0F", border: "1px solid #252528", borderRadius: "8px", padding: "16px", marginTop: "8px" }}>
              <div style={{ fontSize: "9px", color: "#555", letterSpacing: "0.15em", marginBottom: "12px" }}>REVENUE PROJECTIONS</div>
              {[
                { period: "Month 3",  value: "$3K MRR",   color: "#FF006E" },
                { period: "Month 6",  value: "$20K MRR",  color: "#C77DFF" },
                { period: "Month 12", value: "$170K MRR", color: "#22C55E" },
              ].map(r => (
                <div key={r.period} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #141416" }}>
                  <span style={{ fontSize: "11px", color: "#9A9A9F" }}>{r.period}</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: r.color }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "compliance" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ background: "#0D0D0F", border: "1px solid #FF006E30", borderRadius: "4px", padding: "14px", marginBottom: "8px" }}>
              <div style={{ fontSize: "11px", color: "#FF006E", marginBottom: "6px", fontWeight: 700 }}>2257 RECORDS CUSTODIAN</div>
              <div style={{ fontSize: "10px", color: "#666", lineHeight: 1.6 }}>
                Daniel Osazee Ebuehi -- 300 West Valley Blvd #3018, Alhambra CA 91803. IP address and timestamp logged on every age confirmation. CCBill handles performer verification for all processed content.
              </div>
            </div>
            {COMPLIANCE.map((c, i) => (
              <div key={i} style={{ background: "#0D0D0F", border: "1px solid #1A1A2E", borderLeft: "3px solid " + (c.status === "DONE" ? "#22C55E" : c.status === "ACTIVE" ? "#F59E0B" : c.priority === "CRITICAL" ? "#FF006E" : "#4A4A4E"), borderRadius: "4px", padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "#CCC" }}>{c.item}</span>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <span style={{ fontSize: "8px", color: c.priority === "CRITICAL" ? "#FF006E" : c.priority === "HIGH" ? "#F59E0B" : "#555", letterSpacing: "0.1em" }}>{c.priority}</span>
                    <span style={{ fontSize: "8px", color: c.status === "DONE" ? "#22C55E" : c.status === "ACTIVE" ? "#F59E0B" : "#444", letterSpacing: "0.1em" }}>{c.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <div style={{ background: "#0D0D0F", borderTop: "1px solid #1A1A2E", padding: "12px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "9px", color: "#3F3F46", letterSpacing: "0.1em" }}>
          AURA8&#8482; -- SMILING BUBBLES INC. -- ADULTS 18+ ONLY -- 2257 COMPLIANT -- PRIVACY POLICY -- TERMS
        </div>
      </div>

    </div>
  );
}
