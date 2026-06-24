"use client";
import { useState } from "react";

export default function AgeGate() {
  const [email, setEmail] = useState("");
  const [ageChecked, setAgeChecked] = useState(false);
  const [tosChecked, setTosChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = email.includes("@") && ageChecked && tosChecked && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/aura8/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setSent(true);
    } catch (e) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#060608",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "DM Mono, monospace",
        padding: "24px",
      }}>
        <div style={{
          background: "#0D0D0F",
          border: "1px solid #FF006E40",
          borderRadius: "8px",
          padding: "40px",
          maxWidth: "420px",
          width: "100%",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>📧</div>
          <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.2em", marginBottom: "16px" }}>
            AURA8 — CHECK YOUR EMAIL
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#FFF", marginBottom: "12px" }}>
            Verification link sent
          </div>
          <div style={{ fontSize: "13px", color: "#71717A", lineHeight: 1.8, marginBottom: "24px" }}>
            We sent a verification link to <span style={{ color: "#E8E8F0" }}>{email}</span>.
            Click the link in your email to access Aura8. The link expires in 10 minutes.
          </div>
          <div style={{ fontSize: "11px", color: "#52525B", lineHeight: 1.7 }}>
            Did not receive it? Check your spam folder, or{" "}
            <button
              onClick={() => { setSent(false); setLoading(false); }}
              style={{ background: "none", border: "none", color: "#FF006E", cursor: "pointer", fontFamily: "DM Mono, monospace", fontSize: "11px", padding: 0, textDecoration: "underline" }}
            >
              try again
            </button>.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060608",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "DM Mono, monospace",
      padding: "24px",
    }}>
      <div style={{
        background: "#0D0D0F",
        border: "1px solid #FF006E40",
        borderRadius: "8px",
        padding: "40px",
        maxWidth: "420px",
        width: "100%",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.2em", marginBottom: "16px" }}>
          AURA8 — ACCESS REQUIRED
        </div>
        <div style={{ fontSize: "22px", fontWeight: 800, color: "#FFF", marginBottom: "12px" }}>
          Verify Your Age
        </div>
        <div style={{ fontSize: "12px", color: "#666", lineHeight: 1.8, marginBottom: "20px" }}>
          This platform contains AI-generated adult content intended for users 18 years of age or older.
          Enter your email to receive a verification link.
        </div>

        <div style={{ background: "#141416", border: "1px solid #252528", borderRadius: "4px", padding: "12px", marginBottom: "20px", fontSize: "10px", color: "#444", lineHeight: 1.6, textAlign: "left" }}>
          Your email and confirmation are logged for compliance purposes per 18 U.S.C. 2257.
          Records Custodian: Daniel Osazee Ebuehi, 300 West Valley Blvd 3018, Alhambra CA 91803.
        </div>

        {/* Email input */}
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="your@email.com"
          style={{
            width: "100%",
            background: "#141416",
            border: "1px solid #FF006E40",
            borderRadius: "6px",
            padding: "14px 18px",
            fontSize: "14px",
            color: "#E8E8F0",
            fontFamily: "DM Mono, monospace",
            outline: "none",
            marginBottom: "16px",
            boxSizing: "border-box",
          }}
        />

        {/* Age checkbox */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px", textAlign: "left" }}>
          <input
            type="checkbox"
            id="age-confirm"
            checked={ageChecked}
            onChange={e => setAgeChecked(e.target.checked)}
            style={{ marginTop: "2px", accentColor: "#FF006E", cursor: "pointer", flexShrink: 0 }}
          />
          <label htmlFor="age-confirm" style={{ fontSize: "11px", color: "#71717A", lineHeight: 1.7, cursor: "pointer" }}>
            I am 18 years of age or older and understand this site contains AI-generated adult content.
          </label>
        </div>

        {/* ToS checkbox */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "20px", textAlign: "left" }}>
          <input
            type="checkbox"
            id="tos-confirm"
            checked={tosChecked}
            onChange={e => setTosChecked(e.target.checked)}
            style={{ marginTop: "2px", accentColor: "#FF006E", cursor: "pointer", flexShrink: 0 }}
          />
          <label htmlFor="tos-confirm" style={{ fontSize: "11px", color: "#71717A", lineHeight: 1.7, cursor: "pointer" }}>
            I agree to the{" "}
            <a href="/aura8/terms" style={{ color: "#FF006E", textDecoration: "none" }}>Terms of Service</a>
            {", "}
            <a href="/aura8/privacy" style={{ color: "#FF006E", textDecoration: "none" }}>Privacy Policy</a>
            {", and "}
            <a href="/aura8/acceptable-use" style={{ color: "#FF006E", textDecoration: "none" }}>Acceptable Use Policy</a>.
          </label>
        </div>

        {error && (
          <div style={{ background: "#2D0A0A", border: "1px solid #EF444440", borderRadius: "4px", padding: "10px 14px", marginBottom: "16px", fontSize: "11px", color: "#EF4444", textAlign: "left" }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            background: canSubmit ? "#FF006E" : "#333",
            border: "none",
            borderRadius: "4px",
            padding: "14px 32px",
            color: "#FFF",
            fontSize: "12px",
            fontWeight: 700,
            cursor: canSubmit ? "pointer" : "not-allowed",
            fontFamily: "DM Mono, monospace",
            width: "100%",
            marginBottom: "10px",
            letterSpacing: "0.08em",
          }}
        >
          {loading ? "SENDING..." : "SEND VERIFICATION EMAIL"}
        </button>

        <button
          onClick={() => window.location.href = "/dashboard"}
          style={{
            background: "transparent",
            border: "1px solid #252528",
            borderRadius: "4px",
            padding: "14px 32px",
            color: "#555",
            fontSize: "12px",
            cursor: "pointer",
            fontFamily: "DM Mono, monospace",
            width: "100%",
            letterSpacing: "0.08em",
          }}
        >
          EXIT
        </button>

        <div style={{ fontSize: "9px", color: "#333", marginTop: "16px" }}>
          Adults 18+ only. AI-generated content. Aura8 — Smiling Bubbles Inc.
        </div>
      </div>
    </div>
  );
}
