"use client";
/**
 * app/aura8/companion/page.tsx
 *
 * Aura8 AI Companion page.
 *
 * Auth: ContentGate (checks aura8_verified httpOnly cookie via
 * GET /api/aura8/auth/check-verified). Shows AgeGate if not verified.
 * No additional auth hook needed — ContentGate is the codebase's real gate.
 */

export const dynamic = "force-dynamic";

import ContentGate from "@/app/components/content-gate";
import ChatInterface from "./components/ChatInterface";

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------
const C = {
  bg:      "#060608",
  surface: "#0D0D0F",
  border:  "#1A1A2E",
  pink:    "#FF006E",
  pinkDim: "#FF006E20",
  pinkBrd: "#FF006E40",
  muted:   "#71717A",
  faint:   "#3F3F46",
  text:    "#E8E8F0",
  green:   "#10B981",
  font:    "DM Mono, monospace",
};

// ---------------------------------------------------------------------------
// Header bar
// ---------------------------------------------------------------------------
function Header() {
  return (
    <div style={{
      background: C.surface,
      borderBottom: `1px solid ${C.border}`,
      padding: "14px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
    }}>
      {/* Companion identity */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "34px", height: "34px", borderRadius: "50%",
          background: C.pinkDim, border: `1px solid ${C.pinkBrd}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "15px", fontWeight: 900, color: C.pink,
        }}>
          A
        </div>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: C.text, letterSpacing: "0.02em" }}>
            Aura8
          </div>
          <div style={{ fontSize: "9px", color: C.green, letterSpacing: "0.12em", marginTop: "1px" }}>
            ● ONLINE
          </div>
        </div>
      </div>

      {/* Nav link back */}
      <a
        href="/aura8"
        style={{
          fontSize: "10px", color: C.muted, textDecoration: "none",
          letterSpacing: "0.06em", padding: "6px 12px",
          border: `1px solid ${C.border}`, borderRadius: "4px",
          transition: "color 0.15s",
        }}
      >
        ← AURA8
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Companion page shell (visible after auth passes)
// ---------------------------------------------------------------------------
function CompanionShell() {
  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      fontFamily: C.font,
      display: "flex",
      flexDirection: "column",
    }}>
      <Header />

      {/* Chat area fills remaining height */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
        <ChatInterface />
      </div>

      {/* Compact compliance footer */}
      <div style={{
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
        padding: "8px 24px",
        textAlign: "center",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: "9px", color: C.faint, letterSpacing: "0.08em" }}>
          AURA8 · SMILING BUBBLES INC. · ADULTS 18+ ONLY · AI-GENERATED CONTENT
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default export — wrapped in ContentGate for auth enforcement
// ---------------------------------------------------------------------------
export default function CompanionPage() {
  return (
    <ContentGate>
      <CompanionShell />
    </ContentGate>
  );
}
