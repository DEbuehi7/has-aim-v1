"use client";
import { useEffect, useState } from "react";
import AgeGate from "./age-gate";

interface ContentGateProps {
  children: React.ReactNode;
}

export default function ContentGate({ children }: ContentGateProps) {
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for the aura8_verified cookie by calling a lightweight endpoint
    // Since HTTP-only cookies can't be read by JS, we check via a server-side ping
    fetch("/api/aura8/auth/check-verified", { method: "GET", credentials: "include" })
      .then(res => res.json())
      .then(data => setVerified(data.verified === true))
      .catch(() => setVerified(false));
  }, []);

  // Loading state
  if (verified === null) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#060608",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "DM Mono, monospace",
      }}>
        <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.2em" }}>AURA8...</div>
      </div>
    );
  }

  if (!verified) {
    return <AgeGate />;
  }

  return <>{children}</>;
}
