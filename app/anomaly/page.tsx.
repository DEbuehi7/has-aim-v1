"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";

const VERTICALS = [
  "GENERAL", "DSA", "COMPLIANCE", "CAPITAL", "OUTREACH",
  "LEGAL", "PROPERTY", "GRANTS", "VENDORS", "FIELD OPS",
];

export default function AnomalyPage() {
  const [message, setMessage] = useState("");
  const [vertical, setVertical] = useState("GENERAL");
  const [mode, setMode] = useState("2");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);

  const send = async () => {
    if (!message.trim()) return;
    setLoading(true);
    const userMsg = message;
    setMessage("");
    try {
      const res = await fetch("/api/anomaly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, vertical, mode }),
      });
      const data = await res.json();
      const entry = { user: userMsg, response: data.response, persona: data.persona, role: data.role, color: data.color, vertical, mode };
      setHistory(prev => [entry, ...prev]);
      setResponse(data);
    } catch (e) {
      setHistory(prev => [{ user: userMsg, response: "Error — check API key in Vercel env vars.", persona: "SENTINEL", role: "Error", color: "#EF4444", vertical, mode }, ...prev]);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060608", color: "#E8E8F0", fontFamily: "DM Mono, monospace", display: "flex", flexDirection: "column" }}>

      <div style={{ background: "#0D0D0F", borderBottom: "1px solid #1A1A2E", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#555", textTransform: "uppercase" }}>AIM ANOMALY OS</div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#FFF" }}>INTELLIGENCE SHELL</div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "9px", color: "#555" }}>MODE</span>
          {["1", "2"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              background: mode === m ? (m === "1" ? "#FF006E" : "#00E5FF") + "20" : "transparent",
              border: "1px solid " + (mode === m ? (m === "1" ? "#FF006E" : "#00E5FF") : "#252528"),
              color: mode === m ? (m === "1" ? "#FF006E" : "#00E5FF") : "#555",
              padding: "4px 12px", borderRadius: "3px", cursor: "pointer",
              fontSize: "9px", letterSpacing: "0.1em", fontFamily: "DM Mono, monospace",
            }}>MODE {m}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 24px", background: "#0D0D0F", borderBottom: "1px solid #1A1A2E", display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {VERTICALS.map(v => (
          <button key={v} onClick={() => setVertical(v)} style={{
            background: vertical === v ? "#6C5CE720" : "transparent",
            border: "1px solid " + (vertical === v ? "#6C5CE7" : "#252528"),
            color: vertical === v ? "#6C5CE7" : "#555",
            padding: "4px 12px", borderRadius: "3px", cursor: "pointer",
            fontSize: "8px", letterSpacing: "0.1em", fontFamily: "DM Mono, monospace",
          }}>{v}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {history.length === 0 && (
          <div style={{ color: "#333", fontSize: "11px", padding: "40px 0" }}>
            Send a message to activate the Sentinel intelligence layer.
          </div>
        )}
        {history.map((h, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ alignSelf: "flex-end", background: "#141416", border: "1px solid #252528", borderRadius: "6px", padding: "10px 14px", maxWidth: "70%", fontSize: "12px", color: "#C8C8CC" }}>
              {h.user}
            </div>
            <div style={{ alignSelf: "flex-start", background: "#0D0D0F", border: "1px solid " + (h.color ?? "#6C5CE7") + "40", borderLeft: "3px solid " + (h.color ?? "#6C5CE7"), borderRadius: "6px", padding: "12px 16px", maxWidth: "80%" }}>
              <div style={{ fontSize: "8px", color: h.color ?? "#6C5CE7", letterSpacing: "0.15em", marginBottom: "6px" }}>
                {h.persona} — {h.role} — {h.vertical} — MODE {h.mode}
              </div>
              <div style={{ fontSize: "12px", color: "#C8C8CC", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {h.response}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "16px 24px", background: "#0D0D0F", borderTop: "1px solid #1A1A2E", display: "flex", gap: "8px" }}>
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Query the Sentinel..."
          style={{
            flex: 1, background: "#141416", border: "1px solid #252528",
            borderRadius: "4px", padding: "10px 14px", color: "#E8E8F0",
            fontSize: "12px", fontFamily: "DM Mono, monospace", outline: "none",
          }}
        />
        <button onClick={send} disabled={loading} style={{
          background: loading ? "#1A1A2E" : "#6C5CE7",
          border: "none", borderRadius: "4px", padding: "10px 20px",
          color: "#FFF", fontSize: "11px", letterSpacing: "0.1em",
          cursor: loading ? "not-allowed" : "pointer", fontFamily: "DM Mono, monospace",
        }}>
          {loading ? "..." : "SEND"}
        </button>
      </div>

    </div>
  );
}
