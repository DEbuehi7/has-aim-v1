"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

const ALERT_TYPES = ["ALL", "HAP_SUBMISSION", "ABATEMENT", "TAX", "INSPECTION", "GENERAL"];

const ALERT_COLORS = {
  HAP_SUBMISSION: { bg: "#1E3A5F", color: "#93C5FD", icon: "H" },
  ABATEMENT:      { bg: "#4A3000", color: "#FCD34D", icon: "A" },
  TAX:            { bg: "#4C0519", color: "#FCA5A5", icon: "T" },
  INSPECTION:     { bg: "#14532D", color: "#86EFAC", icon: "I" },
  GENERAL:        { bg: "#27272A", color: "#A1A1AA", icon: "G" },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/alerts")
      .then(r => r.json())
      .then(d => { setAlerts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = alerts.filter(a => filter === "ALL" || a.alert_type === filter);
  const unread = alerts.filter(a => !a.read).length;

  const markRead = async (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read: true }),
    });
  };

  const markAllRead = async () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#09090B", color: "#E4E4E7", padding: "24px", fontFamily: "DM Mono, monospace" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#FAFAFA", letterSpacing: "-0.02em" }}>Alerts</h1>
            {unread > 0 && (
              <span style={{ background: "#DC2626", color: "#FFF", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px" }}>
                {unread}
              </span>
            )}
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} style={{ background: "transparent", border: "none", color: "#71717A", fontSize: "11px", cursor: "pointer", fontFamily: "DM Mono, monospace", letterSpacing: "0.05em" }}>
              Mark all read
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          {ALERT_TYPES.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              background: filter === t ? "#FAFAFA" : "#27272A",
              color: filter === t ? "#09090B" : "#A1A1AA",
              border: "1px solid " + (filter === t ? "#FAFAFA" : "#3F3F46"),
              borderRadius: "6px", padding: "6px 12px", fontSize: "11px",
              cursor: "pointer", fontFamily: "DM Mono, monospace", letterSpacing: "0.05em",
            }}>{t.replace(/_/g, " ")}</button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: "#71717A", fontSize: "13px" }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "#71717A", fontSize: "13px" }}>No alerts.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map(a => {
              const c = ALERT_COLORS[a.alert_type] ?? ALERT_COLORS.GENERAL;
              return (
                <div key={a.id} style={{
                  background: "#18181B",
                  border: "1px solid " + (a.read ? "#27272A" : "#3F3F46"),
                  borderRadius: "8px", padding: "16px",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <span style={{
                        width: "32px", height: "32px", borderRadius: "6px", flexShrink: 0,
                        background: c.bg, color: c.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", fontWeight: 700,
                      }}>{c.icon}</span>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <span style={{ background: c.bg, color: c.color, fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px" }}>
                            {(a.alert_type ?? "ALERT").replace(/_/g, " ")}
                          </span>
                          {!a.read && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#EF4444" }} />}
                        </div>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "#FAFAFA", marginBottom: "4px" }}>
                          {a.address ?? "General"}
                        </p>
                        <p style={{ fontSize: "11px", color: "#A1A1AA", lineHeight: 1.6 }}>
                          {a.message ?? "--"}
                        </p>
                        {a.due_date && (
                          <p style={{ fontSize: "10px", color: "#71717A", marginTop: "4px" }}>
                            Due: {a.due_date} — {a.responsible_party ?? "--"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
                      <p style={{ fontSize: "10px", color: "#52525B" }}>
                        {a.created_at ? new Date(a.created_at).toLocaleDateString() : "--"}
                      </p>
                      {!a.read && (
                        <button onClick={() => markRead(a.id)} style={{
                          background: "transparent", border: "none", color: "#71717A",
                          fontSize: "11px", cursor: "pointer", fontFamily: "DM Mono, monospace",
                        }}>Dismiss</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}