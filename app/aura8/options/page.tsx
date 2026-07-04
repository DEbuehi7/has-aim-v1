import Link from "next/link";

const OPTIONS = [
  {
    href: "/aura8/gallery",
    title: "Gallery",
    description: "Browse the Aura8 gallery and open curated content.",
    accent: "#C77DFF",
  },
  {
    href: "/aura8/companion",
    title: "Companion",
    description: "Start a private conversation with the Aura8 companion.",
    accent: "#FF006E",
  },
];

export default function Aura8OptionsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#060608", color: "#E8E8F0", fontFamily: "DM Mono, monospace", padding: "48px 24px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <Link href="/aura8/landing" style={{ display: "inline-block", marginBottom: "24px", color: "#71717A", textDecoration: "none", fontSize: "12px" }}>
          ← Back to Landing
        </Link>

        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.18em", marginBottom: "10px" }}>AURA8 OPTIONS</div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", margin: 0, marginBottom: "12px", color: "#FAFAFA" }}>
            Choose where to begin
          </h1>
          <p style={{ maxWidth: "560px", color: "#9A9A9F", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
            Enter the gallery to explore content or open Companion to start chatting.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {OPTIONS.map((option) => (
            <Link
              key={option.href}
              href={option.href}
              style={{
                textDecoration: "none",
                background: "#0D0D0F",
                border: `1px solid ${option.accent}33`,
                borderRadius: "12px",
                padding: "24px",
                color: "#E8E8F0",
              }}
            >
              <div style={{ fontSize: "10px", color: option.accent, letterSpacing: "0.14em", marginBottom: "10px" }}>OPEN</div>
              <div style={{ fontSize: "22px", fontWeight: 800, marginBottom: "10px" }}>{option.title}</div>
              <div style={{ fontSize: "13px", color: "#71717A", lineHeight: 1.7 }}>{option.description}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
