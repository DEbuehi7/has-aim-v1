"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";

const CRUSHON_LINK = "https://crushon.ai/?ref=mtk1mdd&mist=1";

export default function AiMateLanding() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(183);

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) return;
    setLoading(true);
    try {
      await fetch("/api/aura8/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "aimate" }),
      });
      setSubmitted(true);
      setCount(c => c + 1);
    } catch (e) {
      setSubmitted(true);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060608",
      color: "#E8E8F0",
      fontFamily: "DM Mono, monospace",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(180deg, #0D0010 0%, #060608 100%)",
        padding: "60px 24px 80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "300px",
          background: "radial-gradient(ellipse, #8B5CF618 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ fontSize: "11px", color: "#8B5CF6", letterSpacing: "0.3em", marginBottom: "20px", textTransform: "uppercase" }}>
          AIMature -- Coming Soon
        </div>
        <h1 style={{
          fontSize: "clamp(28px, 6vw, 56px)",
          fontWeight: 900,
          color: "#FAFAFA",
          lineHeight: 1.1,
          marginBottom: "20px",
          letterSpacing: "-0.03em",
        }}>
          AI Companions.<br />
          <span style={{ color: "#8B5CF6" }}>Live. Responsive. Always On.</span>
        </h1>
        <p style={{
          fontSize: "16px",
          color: "#9A9A9F",
          lineHeight: 1.8,
          maxWidth: "560px",
          margin: "0 auto 16px",
        }}>
          The next evolution of AI companionship. Interactive live sessions with synthetic AI personas -- available 24/7, completely private, zero judgment.
        </p>
        <div style={{ fontSize: "12px", color: "#8B5CF6", marginBottom: "32px", letterSpacing: "0.1em" }}>
          {count} people on the early access list
        </div>

        {/* Email capture */}
        {!submitted ? (
          <div style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            flexWrap: "wrap",
            maxWidth: "480px",
            margin: "0 auto 12px",
          }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="your@email.com"
              style={{
                flex: 1,
                minWidth: "220px",
                background: "#141416",
                border: "1px solid #8B5CF640",
                borderRadius: "6px",
                padding: "14px 18px",
                fontSize: "14px",
                color: "#E8E8F0",
                fontFamily: "DM Mono, monospace",
                outline: "none",
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: "#8B5CF6",
                border: "none",
                borderRadius: "6px",
                padding: "14px 24px",
                color: "#FFF",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "DM Mono, monospace",
                letterSpacing: "0.05em",
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "..." : "GET EARLY ACCESS"}
            </button>
          </div>
        ) : (
          <div style={{
            background: "#14532D",
            border: "1px solid #86EFAC40",
            borderRadius: "8px",
            padding: "20px 32px",
            maxWidth: "480px",
            margin: "0 auto 12px",
          }}>
            <div style={{ fontSize: "14px", color: "#86EFAC", fontWeight: 700, marginBottom: "8px" }}>
              You are on the list.
            </div>
            <div style={{ fontSize: "12px", color: "#71717A", marginBottom: "16px" }}>
              Early access members get founding pricing locked forever.
            </div>
            <a href={CRUSHON_LINK} target="_blank" rel="noopener noreferrer" style={{
              display: "block",
              background: "#8B5CF6",
              borderRadius: "6px",
              padding: "12px 24px",
              color: "#FFF",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
              letterSpacing: "0.08em",
              textAlign: "center",
            }}>
              TRY AI COMPANION NOW WHILE YOU WAIT
            </a>
          </div>
        )}
        <p style={{ fontSize: "11px", color: "#52525B" }}>
          Adults 18+ only. No spam. Unsubscribe anytime.
        </p>
      </div>

      {/* Features */}
      <div style={{ padding: "60px 24px", maxWidth: "900px", margin: "0 auto", width: "100%" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "60px",
        }}>
          {[
            { icon: "🎭", title: "Live AI Personas", desc: "Dynamic synthetic companions that respond in real time. Each persona has a unique personality, voice, and presence." },
            { icon: "🔒", title: "Completely Private", desc: "No social login. No public profiles. No data selling. Your sessions stay yours." },
            { icon: "⚡", title: "Always Available", desc: "24/7 access. No scheduling. No waiting. Your companion is online whenever you are." },
            { icon: "🌐", title: "Discreet Billing", desc: "Neutral statement descriptor. No AIMature branding on your statements." },
          ].map(f => (
            <div key={f.title} style={{
              background: "#0D0D0F",
              border: "1px solid #1A1A2E",
              borderRadius: "8px",
              padding: "24px",
            }}>
              <div style={{ fontSize: "24px", marginBottom: "12px" }}>{f.icon}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#FAFAFA", marginBottom: "8px" }}>{f.title}</div>
              <div style={{ fontSize: "12px", color: "#71717A", lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* CrushOn bridge */}
        <div style={{
          background: "#0D0D0F",
          border: "1px solid #8B5CF620",
          borderRadius: "12px",
          padding: "32px",
          textAlign: "center",
          marginBottom: "40px",
        }}>
          <div style={{ fontSize: "10px", color: "#8B5CF6", letterSpacing: "0.2em", marginBottom: "12px" }}>
            AVAILABLE RIGHT NOW
          </div>
          <p style={{ fontSize: "14px", color: "#9A9A9F", lineHeight: 1.7, marginBottom: "20px", maxWidth: "400px", margin: "0 auto 20px" }}>
            While AIMature builds, experience AI companionship now through CrushOn AI -- intelligent private companions available immediately.
          </p>
          <a href={CRUSHON_LINK} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-block",
            background: "#8B5CF6",
            borderRadius: "6px",
            padding: "14px 32px",
            color: "#FFF",
            fontSize: "13px",
            fontWeight: 700,
            textDecoration: "none",
            letterSpacing: "0.08em",
          }}>
            TRY CRUSHON AI -- FREE
          </a>
          <p style={{ fontSize: "9px", color: "#3F3F46", marginTop: "10px" }}>
            Affiliate partnership. AIMature may earn a commission at no cost to you.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: "#0D0D0F",
        borderTop: "1px solid #1A1A2E",
        padding: "20px 24px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "9px", color: "#3F3F46", letterSpacing: "0.1em" }}>
          AIMATE -- SMILING BUBBLES INC. -- ADULTS 18+ ONLY --{" "}
          <a href="/aura8/terms" style={{ color: "#52525B", textDecoration: "none" }}>TERMS</a>
          {" "}--{" "}
          <a href="/aura8/privacy" style={{ color: "#52525B", textDecoration: "none" }}>PRIVACY</a>
        </div>
      </div>
    </div>
  );
}
