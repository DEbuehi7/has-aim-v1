"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import ContentGate from "../components/content-gate";

const LINKS = [
  {
    href: "/aura8/gallery",
    label: "Gallery",
    desc: "Explore AI-generated content curated for your preferences.",
    accent: "#C77DFF",
    status: "COMING SOON",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    href: "/aura8/companion",
    label: "AI Companion",
    desc: "Start a private conversation with your Aura8 companion.",
    accent: "#FF006E",
    status: "AVAILABLE",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/aura8/dashboard",
    label: "Dashboard",
    desc: "Manage your profile, settings, and account.",
    accent: "#00B4D8",
    status: "AVAILABLE",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
];

function OverviewContent() {
  return (
    <div style={{ minHeight: "100vh", background: "#060608", color: "#E8E8F0", fontFamily: "DM Mono, monospace" }}>
      {/* Header */}
      <div style={{ background: "#0D0D0F", borderBottom: "1px solid #FF006E30", padding: "16px 24px" }}>
        <div style={{ fontSize: "14px", fontWeight: 800, color: "#FF006E", letterSpacing: "0.1em" }}>AURA8</div>
      </div>

      <div style={{ padding: "48px 24px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.2em", marginBottom: "8px" }}>WELCOME</div>
          <h1 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 900, color: "#FFF", margin: 0, marginBottom: "8px" }}>
            Where would you like to go?
          </h1>
          <p style={{ fontSize: "13px", color: "#52525B", margin: 0 }}>
            Choose from Gallery, AI Companion, or your Dashboard.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {LINKS.map(link => (
            <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: "#0D0D0F",
                border: "1px solid #27272A",
                borderRadius: "10px",
                padding: "24px",
                cursor: "pointer",
                height: "100%",
              }}>
                <div style={{ color: link.accent, marginBottom: "14px" }}>{link.icon}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#E8E8F0" }}>{link.label}</div>
                  <div style={{
                    fontSize: "8px",
                    fontWeight: 700,
                    color: link.status === "AVAILABLE" ? "#10B981" : "#52525B",
                    background: link.status === "AVAILABLE" ? "#10B98120" : "#1A1A2E",
                    border: link.status === "AVAILABLE" ? "1px solid #10B98140" : "1px solid #27272A",
                    borderRadius: "4px",
                    padding: "2px 6px",
                    letterSpacing: "0.05em",
                  }}>
                    {link.status}
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "#52525B", lineHeight: 1.6 }}>{link.desc}</div>
              </div>
            </Link>
          ))}
        </div>
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
      <OverviewContent />
    </ContentGate>
  );
}
