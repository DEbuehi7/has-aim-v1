"use client";
export const dynamic = "force-dynamic";

export default function Aura8AcceptableUse() {
  const prohibited = [
    "Deepfake content replicating or simulating real persons",
    "Any content involving minors or age-ambiguous subjects",
    "Non-consensual scenarios of any kind",
    "Incest or family-relation scenarios",
    "Violence, abuse, snuff, or harm scenarios",
    "Bestiality or animal content",
    "Content depicting illegal activity",
    "Hate speech, discrimination, or extremist content",
    "Professional advice including medical, legal, or financial guidance",
    "Content depicting intoxication, impairment, or hypnosis",
    "Prostitution or escorting scenarios",
    "Copyright-infringing content or real person likenesses",
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060608",
      color: "#E8E8F0",
      fontFamily: "DM Mono, monospace",
    }}>
      <div style={{
        borderBottom: "1px solid #1A1A2E",
        padding: "32px 24px",
        textAlign: "center",
      }}>
        <a href="/aura8/landing" style={{
          color: "#FF006E",
          textDecoration: "none",
          fontSize: "11px",
          letterSpacing: "0.2em",
        }}>
          AURA8
        </a>
        <h1 style={{
          fontSize: "24px",
          fontWeight: 900,
          color: "#FAFAFA",
          marginTop: "16px",
          marginBottom: "8px",
          letterSpacing: "-0.02em",
        }}>
          Acceptable Use Policy
        </h1>
        <p style={{ fontSize: "11px", color: "#52525B" }}>
          Last updated: June 2026 -- Smiling Bubbles Inc.
        </p>
      </div>

      <div style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "48px 24px 80px",
      }}>

        <div style={{
          background: "#0D0D0F",
          border: "1px solid #FF006E30",
          borderRadius: "8px",
          padding: "20px 24px",
          marginBottom: "40px",
          fontSize: "12px",
          color: "#9A9A9F",
          lineHeight: 1.8,
        }}>
          All content on Aura8 is 100% AI-generated synthetic media.
          No real persons are depicted. By using this platform you
          agree to this Acceptable Use Policy in full.
        </div>

        <div style={{ marginBottom: "36px" }}>
          <h2 style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#FF006E",
            letterSpacing: "0.05em",
            marginBottom: "12px",
            textTransform: "uppercase",
          }}>
            1. Platform Purpose
          </h2>
          <p style={{
            fontSize: "13px",
            color: "#9A9A9F",
            lineHeight: 1.9,
          }}>
            Aura8 is an AI companion platform for adults 18 and older.
            All companions are fully synthetic AI constructs created by
            generative AI systems. No real human performers, likenesses,
            or identities are used at any stage of content generation.
          </p>
        </div>

        <div style={{ marginBottom: "36px" }}>
          <h2 style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#FF006E",
            letterSpacing: "0.05em",
            marginBottom: "16px",
            textTransform: "uppercase",
          }}>
            2. Prohibited Content and Uses
          </h2>
          <p style={{
            fontSize: "13px",
            color: "#9A9A9F",
            lineHeight: 1.9,
            marginBottom: "16px",
          }}>
            The following content and uses are strictly prohibited
            on the Aura8 platform:
          </p>
          {prohibited.map((item, i) => (
            <div key={i} style={{
              display: "flex",
              gap: "12px",
              marginBottom: "12px",
              alignItems: "flex-start",
            }}>
              <div style={{
                color: "#FF006E",
                fontSize: "11px",
                marginTop: "2px",
                flexShrink: 0,
              }}>
                --
              </div>
              <p style={{
                fontSize: "13px",
                color: "#9A9A9F",
                lineHeight: 1.7,
                margin: 0,
              }}>
                {item}
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: "36px" }}>
          <h2 style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#FF006E",
            letterSpacing: "0.05em",
            marginBottom: "12px",
            textTransform: "uppercase",
          }}>
            3. AI Content Disclosure
          </h2>
          <p style={{
            fontSize: "13px",
            color: "#9A9A9F",
            lineHeight: 1.9,
          }}>
            All content generated on this platform is produced by
            artificial intelligence and is labeled as such at every
            access point. No content depicts real persons. Users
            acknowledge that all interactions are with synthetic
            AI constructs and not real humans.
          </p>
        </div>

        <div style={{ marginBottom: "36px" }}>
          <h2 style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#FF006E",
            letterSpacing: "0.05em",
            marginBottom: "12px",
            textTransform: "uppercase",
          }}>
            4. Enforcement
          </h2>
          <p style={{
            fontSize: "13px",
            color: "#9A9A9F",
            lineHeight: 1.9,
          }}>
            Violations of this policy result in immediate account
            termination without refund. Reported violations are
            reviewed within 24 hours. Content found in violation
            is removed immediately. Smiling Bubbles Inc. reserves
            the right to report violations to relevant authorities
            where required by law.
          </p>
        </div>

        <div style={{ marginBottom: "36px" }}>
          <h2 style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#FF006E",
            letterSpacing: "0.05em",
            marginBottom: "12px",
            textTransform: "uppercase",
          }}>
            5. Contact
          </h2>
          <p style={{
            fontSize: "13px",
            color: "#9A9A9F",
            lineHeight: 1.9,
          }}>
            To report a violation or for policy questions:
            Smiling Bubbles Inc. -- EDOAURA8@proton.me -- aura8.fun
          </p>
        </div>

        <div style={{
          borderTop: "1px solid #1A1A2E",
          paddingTop: "32px",
          textAlign: "center",
        }}>
          <a href="/aura8/landing" style={{
            display: "inline-block",
            border: "1px solid #FF006E",
            borderRadius: "6px",
            padding: "12px 24px",
            color: "#FF006E",
            fontSize: "12px",
            fontWeight: 700,
            textDecoration: "none",
            letterSpacing: "0.08em",
          }}>
            BACK TO AURA8
          </a>
        </div>
      </div>

      <div style={{
        background: "#0D0D0F",
        borderTop: "1px solid #1A1A2E",
        padding: "20px 24px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "9px", color: "#3F3F46", letterSpacing: "0.1em" }}>
          AURA8 -- SMILING BUBBLES INC. -- ADULTS 18+ ONLY --{" "}
          <a href="/aura8/terms" style={{ color: "#52525B", textDecoration: "none" }}>TERMS</a>
          {" "}--{" "}
          <a href="/aura8/privacy" style={{ color: "#52525B", textDecoration: "none" }}>PRIVACY</a>
        </div>
      </div>
    </div>
  );
}
