"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const LINKS = [
  { href: "/dashboard",  label: "SENTINEL",   color: "#00E5FF" },
  { href: "/deals",      label: "PIPELINE B",  color: "#2ECC71" },
  { href: "/alerts",     label: "ALERTS",      color: "#FF3C6E" },
  { href: "/contacts",   label: "CONTACTS",    color: "#00E5FF" },
  { href: "/anomaly",    label: "ANOMALY OS",  color: "#FF006E" },
  { href: "/pulse",      label: "PULSE",       color: "#C77DFF" },
  { href: "/aura8", label: "AURA8", color: "#FF006E" },
  { href: "/pure",       label: "PURE",        color: "#C8A96E" },
  { href: "/grants",     label: "GRANTS",      color: "#FFD700" },
  { href: "/field",      label: "FIELD OPS",   color: "#F4A261" },
  { href: "/vendors",    label: "VENDORS",     color: "#C77DFF" },
  { href: "/settings",   label: "SETTINGS",    color: "#808080" },
  { href: "/callscript", label: "CALL",        color: "#2ECC71" },
];

export default function Nav() {
  const path = usePathname();
  
  // Hide Nav if inside /aura8/* or /pure/*
  if (path.startsWith("/aura8") || path.startsWith("/pure")) {
    return null;
  }

  return (
    <div style={{
      background: "#04040A",
      borderBottom: "1px solid #1A1A2E",
      padding: "0 20px",
      display: "flex",
      alignItems: "center",
      height: 36,
      position: "sticky",
      top: 0,
      zIndex: 100,
      fontFamily: "'Courier New', monospace",
      overflowX: "auto",
    }}>
      <Link href="/dashboard" style={{ textDecoration: "none", marginRight: 16, flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: "#FFF", letterSpacing: "0.1em" }}>
          AIM <span style={{ color: "#00E5FF" }}>OS</span>
        </span>
      </Link>
      <div style={{ display: "flex", gap: 0, flex: 1 }}>
        {LINKS.map(link => {
          const active = path === link.href;
          return (
            <Link key={link.href} href={link.href} style={{ textDecoration: "none", flexShrink: 0 }}>
              <div style={{
                padding: "0 14px",
                height: 36,
                display: "flex",
                alignItems: "center",
                borderBottom: "2px solid " + (active ? link.color : "transparent"),
                color: active ? link.color : "#484848",
                fontSize: 9,
                letterSpacing: "0.12em",
                fontWeight: active ? 700 : 400,
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}>
                {link.label}
              </div>
            </Link>
          );
        })}
      </div>
      <span style={{ fontSize: 8, color: "#1A1A2E", letterSpacing: "0.1em", flexShrink: 0 }}>
        aim2030app.com
      </span>
    </div>
  );
}
