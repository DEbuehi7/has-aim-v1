"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ComplianceLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/compliance-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      const data = await res.json();
      localStorage.setItem("compliance_session_token", data.session_token);
      router.push("/aura8/compliance-review");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060608",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "DM Mono, monospace",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#0D0D0F",
          border: "1px solid #FF006E40",
          borderRadius: "8px",
          padding: "40px",
          maxWidth: "420px",
          width: "100%",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            color: "#FF006E",
            letterSpacing: "0.2em",
            marginBottom: "24px",
            textTransform: "uppercase",
          }}
        >
          AURA8 — COMPLIANCE ACCESS
        </div>

        <div
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: "#FFF",
            marginBottom: "32px",
          }}
        >
          Compliance Review Login
        </div>

        {error && (
          <div
            style={{
              background: "#EF444430",
              color: "#EF4444",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "16px",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !loading && handleLogin()}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: "#1A1A1D",
            border: "1px solid #3F3F46",
            borderRadius: "6px",
            color: "#FFF",
            marginBottom: "12px",
            fontFamily: "DM Mono, monospace",
            fontSize: "14px",
            opacity: loading ? 0.6 : 1,
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !loading && handleLogin()}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: "#1A1A1D",
            border: "1px solid #3F3F46",
            borderRadius: "6px",
            color: "#FFF",
            marginBottom: "24px",
            fontFamily: "DM Mono, monospace",
            fontSize: "14px",
            opacity: loading ? 0.6 : 1,
          }}
        />

        <button
          onClick={handleLogin}
          disabled={loading || !username || !password}
          style={{
            width: "100%",
            padding: "12px",
            background: loading || !username || !password ? "#FF006E60" : "#FF006E",
            border: "none",
            borderRadius: "6px",
            color: "#FFF",
            fontSize: "13px",
            fontWeight: 700,
            cursor: loading || !username || !password ? "default" : "pointer",
            transition: "background 0.2s",
            fontFamily: "DM Mono, monospace",
          }}
        >
          {loading ? "Authenticating..." : "Access Compliance Dashboard"}
        </button>

        <div
          style={{
            fontSize: "10px",
            color: "#52525B",
            marginTop: "24px",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Authorized Visa/Mastercard compliance personnel only.
          <br />
          Unauthorized access is prohibited.
          <br />
          All access is logged and audited.
        </div>
      </div>
    </div>
  );
}
