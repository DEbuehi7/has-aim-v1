"use client";

import { FormEvent, useEffect, useState } from "react";

export default function ComplianceLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const existingToken = window.localStorage.getItem("compliance_session_token");
    if (existingToken) {
      window.location.replace("/aura8/compliance-review");
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/compliance-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        session_token?: string;
        expires_at?: string;
      };

      if (!response.ok || !payload.session_token) {
        setError(payload.error ?? "Login failed");
        return;
      }

      window.localStorage.setItem(
        "compliance_session_token",
        payload.session_token
      );
      if (payload.expires_at) {
        window.localStorage.setItem(
          "compliance_session_expires_at",
          payload.expires_at
        );
      }
      window.localStorage.setItem(
        "compliance_last_activity",
        Date.now().toString()
      );

      window.location.assign("/aura8/compliance-review");
    } catch (requestError) {
      console.error("[compliance-login] Request failed:", requestError);
      setError("Unable to log in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060608",
        color: "#FAFAFA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "DM Mono, monospace",
        padding: "24px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#0D0D0F",
          border: "1px solid #FF006E40",
          borderRadius: "10px",
          padding: "32px",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            color: "#FF006E",
            letterSpacing: "0.2em",
            marginBottom: "18px",
          }}
        >
          AURA8 · COMPLIANCE ACCESS
        </div>

        <h1 style={{ fontSize: "22px", margin: 0, marginBottom: "24px" }}>
          Compliance Review Login
        </h1>

        {error ? (
          <div
            style={{
              marginBottom: "16px",
              background: "#EF444420",
              border: "1px solid #EF444450",
              color: "#FCA5A5",
              fontSize: "12px",
              padding: "10px 12px",
              borderRadius: "6px",
            }}
          >
            {error}
          </div>
        ) : null}

        <input
          type="text"
          autoComplete="username"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "6px",
            border: "1px solid #3F3F46",
            background: "#1A1A1D",
            color: "#FAFAFA",
            fontFamily: "DM Mono, monospace",
          }}
        />

        <input
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "22px",
            borderRadius: "6px",
            border: "1px solid #3F3F46",
            background: "#1A1A1D",
            color: "#FAFAFA",
            fontFamily: "DM Mono, monospace",
          }}
        />

        <button
          type="submit"
          disabled={isLoading || !username.trim() || !password}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "6px",
            border: "none",
            background: "#FF006E",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
            opacity: isLoading ? 0.75 : 1,
          }}
        >
          {isLoading ? "Checking credentials..." : "Access Compliance Dashboard"}
        </button>

        <p
          style={{
            marginTop: "18px",
            fontSize: "10px",
            color: "#71717A",
            lineHeight: 1.7,
            textAlign: "center",
          }}
        >
          Authorized CCBill, Visa, and Mastercard compliance personnel only.
          <br />
          All access is monitored and logged.
        </p>
      </form>
    </div>
  );
}
