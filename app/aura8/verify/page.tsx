"use client";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const CRUSHON_LINK = "https://crushon.ai/?ref=mtk1mdd&mist=1";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!token) {
      setErrorMsg("No verification token found. Please check your email link.");
      setStatus("error");
      return;
    }

    fetch("/api/aura8/auth/email-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus("success");
        } else {
          setErrorMsg(data.error ?? "Verification failed. Please try again.");
          setStatus("error");
        }
      })
      .catch(() => {
        setErrorMsg("Network error. Please try again.");
        setStatus("error");
      });
  }, [token]);

  useEffect(() => {
    if (status !== "success") return;
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer);
          window.location.href = "/aura8/dashboard";
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060608",
      color: "#E8E8F0",
      fontFamily: "DM Mono, monospace",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{
        background: "#0D0D0F",
        border: "1px solid #FF006E40",
        borderRadius: "8px",
        padding: "48px 40px",
        maxWidth: "420px",
        width: "100%",
        textAlign: "center",
      }}>

        {status === "loading" && (
          <>
            <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.2em", marginBottom: "16px" }}>
              AURA8 — VERIFYING
            </div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#FFF", marginBottom: "12px" }}>
              Confirming your email...
            </div>
            <div style={{ fontSize: "13px", color: "#71717A" }}>Please wait a moment.</div>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: "48px", marginBottom: "24px" }}>✓</div>
            <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.2em", marginBottom: "16px" }}>
              AURA8 — VERIFIED
            </div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#FFF", marginBottom: "12px" }}>
              Email Confirmed
            </div>
            <div style={{ fontSize: "13px", color: "#71717A", lineHeight: 1.7, marginBottom: "32px" }}>
              Your age has been verified. Welcome to Aura8.
              You will be redirected in {countdown} seconds.
            </div>
            <a href="/aura8/dashboard" style={{
              display: "block",
              background: "#FF006E",
              border: "none",
              borderRadius: "6px",
              padding: "14px 24px",
              color: "#FFF",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
              letterSpacing: "0.08em",
              marginBottom: "16px",
            }}>
              ENTER AURA8 NOW
            </a>
            <div style={{
              background: "#141416",
              border: "1px solid #FF006E20",
              borderRadius: "8px",
              padding: "16px",
              marginTop: "16px",
            }}>
              <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.15em", marginBottom: "8px" }}>
                WHILE YOU WAIT
              </div>
              <a href={CRUSHON_LINK} target="_blank" rel="noopener noreferrer" style={{
                display: "block",
                border: "1px solid #FF006E",
                borderRadius: "6px",
                padding: "10px 16px",
                color: "#FF006E",
                fontSize: "11px",
                fontWeight: 700,
                textDecoration: "none",
                letterSpacing: "0.06em",
              }}>
                EXPLORE CRUSHON AI
              </a>
            </div>
            <div style={{ fontSize: "9px", color: "#3F3F46", marginTop: "24px", lineHeight: 1.6 }}>
              Email verified. Adults 18+ only. AI-generated content.
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: "48px", marginBottom: "24px" }}>✗</div>
            <div style={{ fontSize: "10px", color: "#EF4444", letterSpacing: "0.2em", marginBottom: "16px" }}>
              AURA8 — VERIFICATION FAILED
            </div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#FFF", marginBottom: "12px" }}>
              Link Invalid or Expired
            </div>
            <div style={{ fontSize: "13px", color: "#71717A", lineHeight: 1.7, marginBottom: "32px" }}>
              {errorMsg}
            </div>
            <a href="/aura8" style={{
              display: "block",
              background: "#FF006E",
              border: "none",
              borderRadius: "6px",
              padding: "14px 24px",
              color: "#FFF",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
              letterSpacing: "0.08em",
              marginBottom: "10px",
            }}>
              TRY AGAIN
            </a>
            <div style={{ fontSize: "9px", color: "#3F3F46", marginTop: "16px" }}>
              Verification links expire after 10 minutes. Request a new one from the age gate.
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default function Aura8VerifyPage() {
  return (
    <Suspense fallback={
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
    }>
      <VerifyContent />
    </Suspense>
  );
}
