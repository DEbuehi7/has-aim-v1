"use client";
export const dynamic = "force-dynamic";

export default function Aura8Terms() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      body: "By accessing or using Aura8 (aura8.fun), you confirm that you are at least 18 years of age, that you have read and agree to these Terms of Service, and that you are legally permitted to access adult content in your jurisdiction. If you do not meet these requirements, you must leave this site immediately.",
    },
    {
      title: "2. Age Verification",
      body: "Aura8 is an adult platform. Access is restricted to individuals 18 years of age or older. By confirming your age and accessing this platform, you represent under penalty of perjury that you are 18 or older. Your IP address, timestamp, and user agent are logged at the time of age confirmation for compliance purposes.",
    },
    {
      title: "3. 18 U.S.C. 2257 Records Compliance",
      body: "All content accessible through Aura8 is AI-generated. No real persons appear in any depictions. In compliance with 18 U.S.C. Section 2257 and 28 C.F.R. Part 75, the designated records custodian for Aura8 is:\n\nDaniel Osazee Ebuehi\nSmiling Bubbles Inc.\nc/o iPostal1\nLos Angeles, CA\nUnited States\n\nRecords required by 18 U.S.C. 2257 are maintained at the above address and are available for inspection as required by law. All AI-generated content on this platform is produced without the use of real performers, and no visual depictions of actual human beings engaged in sexually explicit conduct are hosted on this platform.",
    },
    {
      title: "4. Platform Description",
      body: "Aura8 is an AI companion platform operated by Smiling Bubbles Inc. The platform offers subscription-based access to AI-generated companion experiences. All companions are fictional AI constructs. No human performers are involved in any content on this platform.",
    },
    {
      title: "5. Subscriptions and Billing",
      body: "Aura8 offers monthly and lifetime subscription tiers. Billing is processed through CCBill, LLC, a third-party payment processor. Your statement will display a neutral billing descriptor. Subscriptions automatically renew unless cancelled before the renewal date. Refunds are subject to CCBill refund policies. For billing inquiries, contact CCBill directly at https://ccbill.com/consumer-support.",
    },
    {
      title: "6. Prohibited Uses",
      body: "You agree not to: (a) access the platform if you are under 18; (b) share your account credentials; (c) reproduce, distribute, or resell any content from the platform; (d) use the platform to harass, harm, or exploit any person; (e) attempt to reverse-engineer or extract any AI model or system from the platform; (f) use automated tools to scrape or access the platform without written permission.",
    },
    {
  title: "6a. Deepfake Prohibition",
  body: "Users are strictly prohibited from using Aura8 to generate deepfake content of any kind. Deepfake content is defined as any AI-generated image, video, or audio that replicates or simulates the likeness of a real person without explicit documented consent. All Aura8 companions are fully synthetic AI constructs with no connection to real persons.",
},
{
  title: "6b. AI Content Disclosure",
  body: "All content generated on Aura8 is produced entirely by artificial intelligence systems. No real human performers, likenesses, or identities are used in any content on this platform. All companion personas are fictional synthetic constructs. Content is labeled as AI-generated at all access points.",
},
    {
      title: "7. Privacy",
      body: "Your use of the platform is governed by our Privacy Policy, available at aura8.fun/aura8/privacy. We do not sell your personal data. Email addresses collected via waitlist are used solely to notify you of platform launch and updates.",
    },
    {
      title: "8. Intellectual Property",
      body: "All platform content, design, architecture, AI systems, brand identity, and generated outputs are the exclusive property of Smiling Bubbles Inc. and its licensors. Unauthorized reproduction or distribution is strictly prohibited and may result in legal action.",
    },
    {
      title: "9. Disclaimer of Warranties",
      body: "The platform is provided AS IS without warranties of any kind, express or implied. Smiling Bubbles Inc. does not warrant that the platform will be uninterrupted, error-free, or free of harmful components. Your use of the platform is at your sole risk.",
    },
    {
      title: "10. Limitation of Liability",
      body: "To the maximum extent permitted by law, Smiling Bubbles Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Total liability shall not exceed the amount paid by you in the 12 months preceding any claim.",
    },
    {
      title: "11. Governing Law",
      body: "These Terms are governed by the laws of the State of California, United States, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Los Angeles County, California.",
    },
    {
      title: "12. Changes to Terms",
      body: "Smiling Bubbles Inc. reserves the right to modify these Terms at any time. Continued use of the platform after changes are posted constitutes acceptance of the revised Terms. Material changes will be communicated via email to waitlist and subscriber addresses on file.",
    },
    {
      title: "13. Contact",
      body: "For questions regarding these Terms, contact:\nSmiling Bubbles Inc.\nEmail: EDOAURA8@proton.me\nWebsite: aura8.fun",
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
          Terms of Service
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
          border: "1px solid #FF006E30",
          borderRadius: "8px",
          padding: "20px 24px",
          marginBottom: "40px",
          fontSize: "12px",
          color: "#9A9A9F",
          lineHeight: 1.8,
        }}>
          IMPORTANT: This platform contains adult content. By using Aura8, you confirm you are 18 or older and legally permitted to access adult content in your jurisdiction.
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
          <a href="/aura8/privacy" style={{ color: "#52525B", textDecoration: "none" }}>PRIVACY POLICY</a>
        </div>
      </div>
    </div>
  );
}
