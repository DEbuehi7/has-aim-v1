"use client";
export const dynamic = "force-dynamic";

export default function Aura8Privacy() {
  const sections = [
    {
      title: "1. Who We Are",
      body: "Aura8 (aura8.fun) is operated by Smiling Bubbles Inc., a California corporation. This Privacy Policy explains how we collect, use, and protect your information when you use our platform.",
    },
    {
      title: "2. Information We Collect",
      body: "We collect the following information:\n\n-- Email address: when you join the waitlist or create an account.\n-- IP address, timestamp, and user agent: logged at the time of age verification for legal compliance purposes (18 U.S.C. 2257 and COPPA).\n-- Payment information: processed and stored by CCBill, LLC. Aura8 does not store or have access to your payment card details.\n-- Usage data: general platform analytics to improve the service (no personally identifiable behavioral tracking).",
    },
    {
      title: "3. How We Use Your Information",
      body: "We use your information to:\n\n-- Notify waitlist members of platform launch and updates.\n-- Verify that users are 18 or older as required by law.\n-- Process subscription payments through our payment processor.\n-- Maintain records required by 18 U.S.C. Section 2257.\n-- Improve platform performance and user experience.",
    },
    {
      title: "4. What We Do Not Do",
      body: "Smiling Bubbles Inc. does not:\n\n-- Sell your personal data to third parties.\n-- Share your email address with advertisers.\n-- Use your data to build advertising profiles.\n-- Display your activity publicly in any form.",
    },
    {
      title: "5. Age Verification Logging",
      body: "When you confirm your age on this platform, we log your IP address, the timestamp of confirmation, and your browser user agent. This data is retained for legal compliance purposes and is not used for marketing or behavioral tracking. This logging is required under federal law.",
    },
    {
      title: "6. Cookies",
      body: "Aura8 uses minimal session cookies required for platform functionality (login state, age gate confirmation). We do not use third-party advertising cookies or tracking pixels.",
    },
    {
      title: "7. Third-Party Services",
      body: "Aura8 integrates with the following third-party services:\n\n-- CCBill, LLC: payment processing. CCBill's privacy policy governs how your payment data is handled. See ccbill.com/privacy.\n-- CrushOn AI: affiliate partner. If you click through to CrushOn AI, their privacy policy applies.\n-- Vercel: platform hosting and edge delivery.\n-- Supabase: database infrastructure (data stored in the United States).",
    },
    {
      title: "8. Data Retention",
      body: "Email addresses are retained for as long as your account is active or until you unsubscribe. Age verification logs are retained for a minimum of 7 years as required by 18 U.S.C. 2257. You may request deletion of your email from our waitlist at any time by contacting EDOAURA8@proton.me.",
    },
    {
      title: "9. Your Rights",
      body: "If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA), including the right to know what personal data we hold, the right to request deletion, and the right to opt out of sale (we do not sell your data). To exercise these rights, contact EDOAURA8@proton.me.",
    },
    {
      title: "10. Security",
      body: "We use industry-standard security measures including encrypted database storage, row-level security policies, and HTTPS-only access. No security system is perfect -- if you have concerns about a security vulnerability, contact EDOAURA8@proton.me.",
    },
    {
      title: "11. Children",
      body: "Aura8 is strictly for adults 18 and older. We do not knowingly collect any information from persons under 18. If we become aware that a minor has provided personal information, we will delete it immediately.",
    },
    {
      title: "12. Changes to This Policy",
      body: "We may update this Privacy Policy from time to time. Material changes will be communicated via email to subscribers. Continued use of the platform after changes are posted constitutes acceptance.",
    },
    {
      title: "13. Contact",
      body: "For privacy inquiries:\nSmiling Bubbles Inc.\nEmail: EDOAURA8@proton.me\nWebsite: aura8.fun",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060608",
      color: "#E8E8F0",
      fontFamily: "DM Mono, monospace",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1A1A2E",
        padding: "32px 24px",
        textAlign: "center",
      }}>
        <a href="/aura8/landing" style={{ color: "#FF006E", textDecoration: "none", fontSize: "11px", letterSpacing: "0.2em" }}>
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
          Privacy Policy
        </h1>
        <p style={{ fontSize: "11px", color: "#52525B" }}>
          Last updated: May 2026 -- Smiling Bubbles Inc.
        </p>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "48px 24px 80px",
      }}>
        <div style={{
          background: "#0D0D0F",
          border: "1px solid #1A1A2E",
          borderRadius: "8px",
          padding: "20px 24px",
          marginBottom: "40px",
          fontSize: "12px",
          color: "#9A9A9F",
          lineHeight: 1.8,
        }}>
          Your privacy is fundamental to how Aura8 is built. We collect the minimum data required to operate legally and improve the platform. We do not sell your data. Ever.
        </div>

        {sections.map((section, i) => (
          <div key={i} style={{ marginBottom: "36px" }}>
            <h2 style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#FF006E",
              letterSpacing: "0.05em",
              marginBottom: "12px",
              textTransform: "uppercase",
            }}>
              {section.title}
            </h2>
            <p style={{
              fontSize: "13px",
              color: "#9A9A9F",
              lineHeight: 1.9,
              whiteSpace: "pre-line",
            }}>
              {section.body}
            </p>
          </div>
        ))}

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

      {/* Footer */}
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
  <a href="/aura8/acceptable-use" style={{ color: "#52525B", textDecoration: "none" }}>ACCEPTABLE USE</a>
</div>
      </div>
    </div>
  );
}
