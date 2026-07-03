"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { useProtectedRoute } from "../hooks/useProtectedRoute";
import Aura8Layout from "../components/Aura8Layout";

const QUICK_LINKS = [
  {
    href: "/aura8/companion",
    label: "AI Companion",
    desc: "Chat with your personal AI companion. Intelligent, private, always available.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    accent: "#FF006E",
    status: "COMING SOON",
  },
  {
    href: "/aura8/gallery",
    label: "Gallery",
    desc: "Explore curated AI-generated content. Personalized to your preferences.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    accent: "#C77DFF",
    status: "COMING SOON",
  },
  {
    href: "/aura8/settings",
    label: "Settings",
    desc: "Manage your profile, content preferences, and privacy controls.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    accent: "#00B4D8",
    status: "AVAILABLE",
  },
];

function DashboardContent() {
  const auth = useProtectedRoute();

  if (auth.status === "loading") return null;

  const emailDisplay = auth.email ?? "Member";
  const firstName = emailDisplay.split("@")[0];

  return (
    <div style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Welcome header */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.2em", marginBottom: "8px" }}>
          WELCOME BACK
        </div>
        <h1 style={{
          fontSize: "clamp(24px, 5vw, 36px)",
          fontWeight: 900,
          color: "#FFF",
          margin: 0,
          marginBottom: "8px",
          letterSpacing: "0.02em",
        }}>
          Hello, {firstName}
        </h1>
        <p style={{ fontSize: "13px", color: "#52525B", margin: 0 }}>
          {emailDisplay} · Verified Member
        </p>
      </div>

      {/* Status banner */}
      <div style={{
        background: "#FF006E10",
        border: "1px solid #FF006E30",
        borderRadius: "8px",
        padding: "16px 20px",
        marginBottom: "32px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}>
        <div style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#10B981",
          flexShrink: 0,
          boxShadow: "0 0 6px #10B981",
        }} />
        <div>
          <div style={{ fontSize: "12px", color: "#E8E8F0", fontWeight: 700, marginBottom: "2px" }}>
            Email Verified — Age Confirmed
          </div>
          <div style={{ fontSize: "10px", color: "#52525B" }}>
            Full platform access · Adults 18+ · AI-generated content
          </div>
        </div>
      </div>

      {/* Quick access grid */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "10px", color: "#52525B", letterSpacing: "0.1em", marginBottom: "16px" }}>
          QUICK ACCESS
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}>
          {QUICK_LINKS.map(link => (
            <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "#0D0D0F",
                  border: "1px solid #27272A",
                  borderRadius: "10px",
                  padding: "24px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  height: "100%",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.border = `1px solid ${link.accent}40`;
                  el.style.background = link.accent + "08";
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.border = "1px solid #27272A";
                  el.style.background = "#0D0D0F";
                  el.style.transform = "translateY(0)";
                }}
              >
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

      {/* Footer info */}
      <div style={{
        borderTop: "1px solid #1A1A2E",
        paddingTop: "24px",
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <div style={{ fontSize: "9px", color: "#3F3F46", letterSpacing: "0.08em" }}>
          AURA8 · SMILING BUBBLES INC. · ADULTS 18+ ONLY
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          {[
            { href: "/aura8/privacy", label: "PRIVACY" },
            { href: "/aura8/terms", label: "TERMS" },
            { href: "/aura8/acceptable-use", label: "ACCEPTABLE USE" },
          ].map(l => (
            <a key={l.href} href={l.href} style={{ fontSize: "9px", color: "#3F3F46", textDecoration: "none", letterSpacing: "0.08em" }}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Aura8DashboardPage() {
  return (
    <Aura8Layout>
      <DashboardContent />
    </Aura8Layout>
  );
}
