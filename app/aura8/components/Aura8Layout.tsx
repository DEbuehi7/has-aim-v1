"use client";
import { useState } from "react";
import { useProtectedRoute } from "../hooks/useProtectedRoute";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface Aura8LayoutProps {
  children: React.ReactNode;
}

function handleLogout() {
  // Clear cookies by navigating to logout endpoint
  fetch("/api/aura8/auth/logout", { method: "POST", credentials: "include" })
    .catch(() => {})
    .finally(() => {
      window.location.href = "/aura8";
    });
}

export default function Aura8Layout({ children }: Aura8LayoutProps) {
  const auth = useProtectedRoute();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (auth.status === "loading") {
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

  if (auth.status === "unverified") {
    return null;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060608",
      display: "flex",
      flexDirection: "column",
      fontFamily: "DM Mono, monospace",
    }}>
      <TopBar
        email={auth.email}
        onMenuToggle={() => setSidebarOpen(o => !o)}
        onLogout={handleLogout}
      />
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        <Sidebar
          onLogout={handleLogout}
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />
        <main style={{
          flex: 1,
          overflowY: "auto",
          background: "#060608",
          color: "#E8E8F0",
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
