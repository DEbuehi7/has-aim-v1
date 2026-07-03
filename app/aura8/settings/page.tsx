"use client";
export const dynamic = "force-dynamic";
import { useProtectedRoute } from "../hooks/useProtectedRoute";
import Aura8Layout from "../components/Aura8Layout";
import SettingsPanel from "../components/SettingsPanel";

function handleLogout() {
  fetch("/api/aura8/auth/logout", { method: "POST", credentials: "include" })
    .catch(() => {})
    .finally(() => {
      window.location.href = "/aura8";
    });
}

function SettingsContent() {
  const auth = useProtectedRoute();
  if (auth.status === "loading") return null;

  return (
    <div style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.2em", marginBottom: "8px", fontFamily: "DM Mono, monospace" }}>
          ACCOUNT
        </div>
        <h1 style={{
          fontSize: "clamp(20px, 4vw, 28px)",
          fontWeight: 900,
          color: "#FFF",
          margin: 0,
          fontFamily: "DM Mono, monospace",
        }}>
          Settings
        </h1>
      </div>
      <SettingsPanel email={auth.email} onLogout={handleLogout} />
    </div>
  );
}

export default function Aura8SettingsPage() {
  return (
    <Aura8Layout>
      <SettingsContent />
    </Aura8Layout>
  );
}
