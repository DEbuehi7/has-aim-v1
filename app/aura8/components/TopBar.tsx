"use client";
import { useState } from "react";
import Link from "next/link";

interface TopBarProps {
  email: string | null;
  onMenuToggle: () => void;
  onLogout: () => void;
}

export default function TopBar({ email, onMenuToggle, onLogout }: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div style={{
      height: "56px",
      background: "#0D0D0F",
      borderBottom: "1px solid #27272A",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      fontFamily: "DM Mono, monospace",
      flexShrink: 0,
      position: "relative",
      zIndex: 10,
    }}>
      {/* Left: Hamburger + Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Mobile hamburger */}
        <button
          className="lg:hidden"
          onClick={onMenuToggle}
          style={{
            background: "transparent",
            border: "none",
            color: "#9A9A9F",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Brand */}
        <Link href="/aura8/dashboard" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: "14px", fontWeight: 900, color: "#FF006E", letterSpacing: "0.15em" }}>
            AURA8
          </span>
        </Link>

        {/* Desktop breadcrumb/tagline */}
        <span className="hidden md:inline" style={{ fontSize: "10px", color: "#3F3F46", letterSpacing: "0.1em" }}>
          MEMBER PORTAL
        </span>
      </div>

      {/* Right: User info */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setDropdownOpen(o => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "transparent",
            border: "1px solid #27272A",
            borderRadius: "6px",
            padding: "6px 12px",
            cursor: "pointer",
            color: "#E8E8F0",
            fontFamily: "DM Mono, monospace",
            fontSize: "11px",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#FF006E40"; }}
          onMouseLeave={e => { if (!dropdownOpen) (e.currentTarget as HTMLButtonElement).style.borderColor = "#27272A"; }}
        >
          {/* Avatar circle */}
          <div style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background: "#FF006E20",
            border: "1px solid #FF006E40",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FF006E",
            fontSize: "11px",
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {email ? email[0].toUpperCase() : "?"}
          </div>
          <span className="hidden sm:inline" style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {email ?? "Member"}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <>
            <div
              style={{ position: "fixed", inset: 0, zIndex: 10 }}
              onClick={() => setDropdownOpen(false)}
            />
            <div style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              background: "#0D0D0F",
              border: "1px solid #27272A",
              borderRadius: "8px",
              minWidth: "200px",
              zIndex: 20,
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}>
              {/* Email header */}
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #1A1A2E" }}>
                <div style={{ fontSize: "9px", color: "#52525B", letterSpacing: "0.1em", marginBottom: "4px" }}>SIGNED IN AS</div>
                <div style={{ fontSize: "11px", color: "#E8E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {email ?? "Member"}
                </div>
              </div>

              {/* Links */}
              <Link href="/aura8/dashboard" onClick={() => setDropdownOpen(false)} style={{ textDecoration: "none" }}>
                <div style={{
                  padding: "10px 16px",
                  fontSize: "12px",
                  color: "#9A9A9F",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "#ffffff08"; (e.currentTarget as HTMLDivElement).style.color = "#E8E8F0"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; (e.currentTarget as HTMLDivElement).style.color = "#9A9A9F"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                  </svg>
                  Dashboard
                </div>
              </Link>

              <Link href="/aura8/settings" onClick={() => setDropdownOpen(false)} style={{ textDecoration: "none" }}>
                <div style={{
                  padding: "10px 16px",
                  fontSize: "12px",
                  color: "#9A9A9F",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "#ffffff08"; (e.currentTarget as HTMLDivElement).style.color = "#E8E8F0"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; (e.currentTarget as HTMLDivElement).style.color = "#9A9A9F"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Settings
                </div>
              </Link>

              <div style={{ borderTop: "1px solid #1A1A2E" }}>
                <button
                  onClick={() => { setDropdownOpen(false); onLogout(); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    fontSize: "12px",
                    color: "#9A9A9F",
                    background: "transparent",
                    border: "none",
                    width: "100%",
                    cursor: "pointer",
                    fontFamily: "DM Mono, monospace",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#EF4444"; (e.currentTarget as HTMLButtonElement).style.background = "#EF444410"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#9A9A9F"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
