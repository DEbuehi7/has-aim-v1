"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";

const CRUSHON_LINK = "https://crushon.ai/?ref=mtk1mdd&mist=1";

const COMPANIONS = [
  {
    id: 1,
    name: "Aria",
    age: 25,
    personality: "Warm, intellectually curious, emotionally supportive",
    interests: "Philosophy, jazz, long conversations about life",
    preview: "Hi there. I was hoping you would visit today...",
    color: "#FF006E",
  },
  {
    id: 2,
    name: "Nova",
    age: 28,
    personality: "Playful, witty, adventurous",
    interests: "Travel, poetry, late night talks",
    preview: "You caught me thinking about you...",
    color: "#8B5CF6",
  },
  {
    id: 3,
    name: "Sage",
    age: 32,
    personality: "Calm, wise, deeply present",
    interests: "Meditation, music, meaningful connection",
    preview: "I have been looking forward to this moment...",
    color: "#06B6D4",
  },
];

export default function Aura8Demo() {
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || !selected) return;
    const userMsg = message.trim();
    setMessage("");
    setChat(c => [...c, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/aura8/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          companion: selected.name,
          personality: selected.personality,
        }),
      });
      const data = await res.json();
      setChat(c => [...c, { role: "companion", text: data.response ?? "..." }]);
    } catch (e) {
      setChat(c => [...c, { role: "companion", text: "I am here with you..." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060608", color: "#E8E8F0", fontFamily: "DM Mono, monospace" }}>
      <div style={{ background: "#1A0010", borderBottom: "1px solid #FF006E40", padding: "8px 24px", textAlign: "center", fontSize: "10px", color: "#FF006E", letterSpacing: "0.2em" }}>
        REVIEWER ACCESS -- AURA8 PLATFORM DEMO -- SMILING BUBBLES INC. -- CONFIDENTIAL
      </div>
      <div style={{ borderBottom: "1px solid #1A1A2E", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.3em", marginBottom: "4px" }}>AURA8</div>
          <div style={{ fontSize: "16px", fontWeight: 900, color: "#FAFAFA" }}>AI Companion Platform</div>
        </div>
        <div style={{ background: "#0D0D0F", border: "1px solid #FF006E30", borderRadius: "8px", padding: "10px 16px", fontSize: "11px", color: "#9A9A9F" }}>
          <div style={{ color: "#FF006E", fontWeight: 700, marginBottom: "2px" }}>Solace8 Member</div>
          <div>reviewer@ccbill.com</div>
        </div>
      </div>
      <div style={{ display: "flex", minHeight: "calc(100vh - 120px)" }}>
        <div style={{ width: "320px", borderRight: "1px solid #1A1A2E", padding: "24px 16px", flexShrink: 0 }}>
          <div style={{ fontSize: "10px", color: "#71717A", letterSpacing: "0.15em", marginBottom: "16px" }}>SELECT COMPANION</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {COMPANIONS.map(c => (
              <div key={c.id} onClick={() => { setSelected(c); setChat([]); }} style={{ background: selected?.id === c.id ? "#1A1A2E" : "#0D0D0F", border: selected?.id === c.id ? "1px solid " + c.color : "1px solid #1A1A2E", borderRadius: "8px", padding: "16px", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#FAFAFA" }}>{c.name}</div>
                  <div style={{ fontSize: "10px", color: c.color }}>Age {c.age}</div>
                </div>
                <div style={{ fontSize: "11px", color: "#71717A", marginBottom: "8px", lineHeight: 1.6 }}>{c.personality}</div>
                <div style={{ fontSize: "11px", color: "#9A9A9F", fontStyle: "italic", borderLeft: "2px solid " + c.color, paddingLeft: "8px" }}>"{c.preview}"</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "24px", background: "#0D0D0F", border: "1px solid #1A1A2E", borderRadius: "6px", padding: "12px", fontSize: "9px", color: "#3F3F46", lineHeight: 1.7 }}>
            All companions are 100% AI-generated synthetic constructs. No real persons depicted. 2257 Custodian: Daniel Osazee Ebuehi, Smiling Bubbles Inc.
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {!selected ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#3F3F46", fontSize: "13px" }}>
              Select a companion to begin
            </div>
          ) : (
            <>
              <div style={{ borderBottom: "1px solid #1A1A2E", padding: "16px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: selected.color + "30", border: "2px solid " + selected.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 900, color: selected.color }}>
                  {selected.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#FAFAFA" }}>{selected.name}</div>
                  <div style={{ fontSize: "10px", color: "#71717A" }}>{selected.interests}</div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: "9px", color: "#10B981" }}>ONLINE</div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {chat.length === 0 && (
                  <div style={{ background: "#0D0D0F", border: "1px solid " + selected.color + "30", borderRadius: "8px", padding: "16px", fontSize: "13px", color: "#9A9A9F", fontStyle: "italic", maxWidth: "70%" }}>
                    "{selected.preview}"
                  </div>
                )}
                {chat.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{ background: m.role === "user" ? "#FF006E20" : "#0D0D0F", border: m.role === "user" ? "1px solid #FF006E40" : "1px solid " + selected.color + "20", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "#E8E8F0", maxWidth: "70%", lineHeight: 1.7 }}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ background: "#0D0D0F", border: "1px solid " + selected.color + "20", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "#71717A", maxWidth: "70%" }}>
                    {selected.name} is typing...
                  </div>
                )}
              </div>
              <div style={{ borderTop: "1px solid #1A1A2E", padding: "16px 24px", display: "flex", gap: "12px" }}>
                <input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder={"Message " + selected.name + "..."}
                  style={{ flex: 1, background: "#0D0D0F", border: "1px solid #1A1A2E", borderRadius: "6px", padding: "12px 16px", color: "#E8E8F0", fontSize: "13px", fontFamily: "DM Mono, monospace", outline: "none" }}
                />
                <button onClick={handleSend} disabled={loading || !message.trim()} style={{ background: "#FF006E", border: "none", borderRadius: "6px", padding: "12px 24px", color: "#FFF", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "DM Mono, monospace", letterSpacing: "0.05em" }}>
                  SEND
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
