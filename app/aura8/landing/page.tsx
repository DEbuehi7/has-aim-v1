"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";

const CRUSHON_LINK = "https://crushon.ai/?ref=mtk1mdd&mist=1";

export default function Aura8Landing() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) return;
    setLoading(true);
    try {
      await fetch("/api/aura8/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch (e) {
      setSubmitted(true);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060608", color: "#E8E8F0", fontFamily: "DM Mono, monospace", display: "flex", flexDirection: "column" }}>

      <div style={{ background: "linear-gradient(180deg, #1A0010 0%, #060608 100%)", padding: "60px 24px 80px", textAlign: "center" }}>
        <div style={{ fontSize: "11px", color: "#FF006E", letterSpacing: "0.3em", marginBottom: "20px", textTransform: "uppercase" }}>
          Aura8 — Private Beta
        </div>
        <h1 style={{ fontSize: "clamp(28px, 6vw, 52px)", fontWeight: 900, color: "#FAFAFA", lineHeight: 1.15, marginBottom: "20px", letterSpacing: "-0.03em" }}>
          AI Companionship<br />
          <span style={{ color: "#FF006E" }}>Built for Adults 60+</span>
        </h1>
        <p style={{ fontSize: "16px", color: "#9A9A9F", lineHeight: 1.8, maxWidth: "560px", margin: "0 auto 40px" }}>
          Privacy-first. No social login. No data selling. No chaos. Just intelligent, discreet AI companionship designed with you in mind.
        </p>

        {!submitted ? (
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", maxWidth: "480px", margin: "0 auto 20px" }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="your@email.com"
              style={{
                flex: 1, minWidth: "220px", background: "#141416", border: "1px solid #FF006E40",
                borderRadius: "6px", padding: "14px 18px", fontSize: "14px",
                color: "#E8E8F0", fontFamily: "DM Mono, monospace", outline: "none",
              }}
            />
            <button onClick={handleSubmit} disabled={loading} style={{
              background: "#FF006E", border: "none", borderRadius: "6px",
              padding: "14px 24px", color: "#FFF", fontSize: "13px", fontWeight: 700,
              cursor: "pointer", fontFamily: "DM Mono, monospace", letterSpacing: "0.05em",
              whiteSpace: "nowrap",
            }}>
              {loading ? "..." : "JOIN WAITLIST"}
            </button>
          </div>
        ) : (
          <div style={{ background: "#14532D", border: "1px solid #86EFAC40", borderRadius: "8px", padding: "20px 32px", maxWidth: "480px", margin: "0 auto 20px" }}>
            <div style={{ fontSize: "14px", color: "#86EFAC", fontWeight: 700, marginBottom: "8px" }}>You are on the list.</div>
            <div style={{ fontSize: "12px", color: "#71717A" }}>We will notify you when Aura8 launches. Early members get lifetime pricing.</div>
          </div>
        )}

        <p style={{ fontSize: "11px", color: "#52525B", marginBottom: "32px" }}>
          No spam. Unsubscribe anytime. Your email is never shared.
        </p>

        <div style={{ background: "#0D0D0F", border: "1px solid #FF006E20", borderRadius: "12px", padding: "24px 32px", maxWidth: "480px", margin: "0 auto" }}>
          <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.2em", marginBottom: "12px" }}>WHILE YOU WAIT</div>
          <p style={{ fontSize: "13px", color: "#9A9A9F", lineHeight: 1.7, marginBottom: "20px" }}>
            Experience AI companionship now. CrushOn AI offers intelligent, private AI companions available immediately.
          </p>
          <a href={CRUSHON_LINK} target="_blank" rel="noopener noreferrer" style={{
            display: "block", background: "transparent", border: "1px solid #FF006E",
            borderRadius: "6px", padding: "12px 24px", color: "#FF006E",
            fontSize: "12px", fontWeight: 700, textDecoration: "none",
            letterSpacing: "0.08em", textAlign: "center",
          }}>
            EXPLORE CRUSHON AI →
          </a>
          <p style={{ fontSize: "9px", color: "#3F3F46", marginTop: "10px" }}>
            Affiliate partnership. Aura8 may earn a commission.
          </p>
        </div>
      </div>

      <div style={{ padding: "60px 24px", maxWidth: "900px", margin: "0 auto", width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "60px" }}>
          {[
            { icon: "🔒", title: "Privacy First", desc: "No social login. No data selling. No public profiles. Your activity stays yours." },
            { icon: "🧠", title: "Built for Your Generation", desc: "Clean interface. No infinite scroll. No chaos. Designed for how you actually want to use it." },
            { icon: "💬", title: "Genuine Connection", desc: "AI companions that remember you, understand context, and engage with real emotional intelligence." },
            { icon: "🌐", title: "Discreet by Design", desc: "Billing shows as a neutral descriptor. No Aura8 branding on statements." },
          ].map(f => (
            <div key={f.title} style={{ background: "#0D0D0F", border: "1px solid #1A1A2E", borderRadius: "8px", padding: "24px" }}>
              <div style={{ fontSize: "24px", marginBottom: "12px" }}>{f.icon}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#FAFAFA", marginBottom: "8px" }}>{f.title}</div>
              <div style={{ fontSize: "12px", color: "#71717A", lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", padding: "40px 0", borderTop: "1px solid #1A1A2E" }}>
          <div style={{ fontSize: "10px", color: "#3F3F46", letterSpacing: "0.15em", marginBottom: "8px" }}>EARLY ACCESS PRICING</div>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            <div style={{ background: "#0D0D0F", border: "1px solid #FF006E30", borderRadius: "8px", padding: "24px 32px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: "#71717A", marginBottom: "6px" }}>MONTHLY</div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#FF006E" }}>$9.99</div>
              <div style={{ fontSize: "10px", color: "#52525B" }}>per month</div>
            </div>
            <div style={{ background: "#0D0D0F", border: "1px solid #FF006E60", borderRadius: "8px", padding: "24px 32px", textAlign: "center", position: "relative" }}>
              <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "#FF006E", color: "#FFF", fontSize: "9px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px", whiteSpace: "nowrap" }}>BEST VALUE</div>
              <div style={{ fontSize: "11px", color: "#71717A", marginBottom: "6px" }}>LIFETIME</div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#FF006E" }}>$79.99</div>
              <div style={{ fontSize: "10px", color: "#52525B" }}>one time</div>
            </div>
          </div>
          <p style={{ fontSize: "11px", color: "#52525B", marginTop: "16px" }}>Waitlist members lock in these prices at launch.</p>
        </div>
      </div>

      <div style={{ background: "#0D0D0F", borderTop: "1px solid #1A1A2E", padding: "20px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "9px", color: "#3F3F46", letterSpacing: "0.1em" }}>
          AURA8 — SMILING BUBBLES INC. — ADULTS 18+ ONLY — PRIVACY POLICY — TERMS
        </div>
      </div>

    </div>
  );
}
