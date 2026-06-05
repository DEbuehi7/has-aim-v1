"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";

const STATUSES = [
  { label: "No Answer", value: "called_no_answer", color: "#71717A" },
  { label: "Not Interested", value: "called_not_interested", color: "#EF4444" },
  { label: "Callback Requested", value: "callback_requested", color: "#F59E0B" },
  { label: "Conversation Had", value: "conversation_had", color: "#3B82F6" },
  { label: "Motivated", value: "motivated", color: "#10B981" },
  { label: "Under Contract", value: "under_contract", color: "#8B5CF6" },
];

export default function CallLog() {
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [nextCall, setNextCall] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/has/contacts/list")
      .then(r => r.json())
      .then(d => setContacts(d.contacts ?? []));
  }, []);

  const handleSubmit = async () => {
    if (!selected || !status) return;
    setLoading(true);
    try {
      await fetch("/api/has/contacts/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_id: selected.id,
          status,
          notes,
          next_call_at: nextCall || null,
        }),
      });
      setSubmitted(true);
      setNotes("");
      setStatus("");
      setNextCall("");
      setSelected(null);
      setTimeout(() => setSubmitted(false), 2000);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      color: "#E8E8F0",
      fontFamily: "DM Mono, monospace",
      padding: "24px 16px",
      maxWidth: "480px",
      margin: "0 auto",
    }}>
      <div style={{ fontSize: "11px", color: "#FF006E", letterSpacing: "0.3em", marginBottom: "8px" }}>
        HAS SENTINEL
      </div>
      <h1 style={{ fontSize: "20px", fontWeight: 900, color: "#FAFAFA", marginBottom: "24px" }}>
        Call Logger
      </h1>

      {submitted && (
        <div style={{
          background: "#14532D",
          border: "1px solid #86EFAC40",
          borderRadius: "8px",
          padding: "12px 16px",
          fontSize: "13px",
          color: "#86EFAC",
          marginBottom: "16px",
          textAlign: "center",
        }}>
          Logged successfully
        </div>
      )}

      {/* Contact selector */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "10px", color: "#71717A", letterSpacing: "0.15em", marginBottom: "8px" }}>
          SELECT CONTACT
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {contacts.map(c => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              style={{
                background: selected?.id === c.id ? "#1A1A2E" : "#0D0D0F",
                border: selected?.id === c.id ? "1px solid #FF006E" : "1px solid #1A1A2E",
                borderRadius: "8px",
                padding: "12px 16px",
                color: "#E8E8F0",
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "DM Mono, monospace",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 700 }}>{c.full_name ?? "Unknown"}</div>
              <div style={{ fontSize: "11px", color: "#71717A", marginTop: "2px" }}>{c.property_address}</div>
              <div style={{ fontSize: "10px", color: "#52525B", marginTop: "2px" }}>
                {c.phone_primary ?? "No phone"} -- Attempts: {c.call_attempts ?? 0}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Status buttons */}
      {selected && (
        <>
          <div style={{ fontSize: "10px", color: "#71717A", letterSpacing: "0.15em", marginBottom: "8px" }}>
            CALL OUTCOME
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
            {STATUSES.map(s => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                style={{
                  background: status === s.value ? s.color + "30" : "#0D0D0F",
                  border: status === s.value ? `1px solid ${s.color}` : "1px solid #1A1A2E",
                  borderRadius: "8px",
                  padding: "12px 8px",
                  color: status === s.value ? s.color : "#71717A",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "DM Mono, monospace",
                  letterSpacing: "0.05em",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Notes */}
          <div style={{ fontSize: "10px", color: "#71717A", letterSpacing: "0.15em", marginBottom: "8px" }}>
            NOTES (optional)
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="What did they say..."
            rows={3}
            style={{
              width: "100%",
              background: "#0D0D0F",
              border: "1px solid #1A1A2E",
              borderRadius: "8px",
              padding: "12px",
              color: "#E8E8F0",
              fontSize: "13px",
              fontFamily: "DM Mono, monospace",
              outline: "none",
              resize: "none",
              marginBottom: "16px",
              boxSizing: "border-box",
            }}
          />

          {/* Next call date */}
          <div style={{ fontSize: "10px", color: "#71717A", letterSpacing: "0.15em", marginBottom: "8px" }}>
            NEXT CALL DATE (optional)
          </div>
          <input
            type="datetime-local"
            value={nextCall}
            onChange={e => setNextCall(e.target.value)}
            style={{
              width: "100%",
              background: "#0D0D0F",
              border: "1px solid #1A1A2E",
              borderRadius: "8px",
              padding: "12px",
              color: "#E8E8F0",
              fontSize: "13px",
              fontFamily: "DM Mono, monospace",
              outline: "none",
              marginBottom: "24px",
              boxSizing: "border-box",
            }}
          />

          <button
            onClick={handleSubmit}
            disabled={loading || !status}
            style={{
              width: "100%",
              background: status ? "#FF006E" : "#1A1A2E",
              border: "none",
              borderRadius: "8px",
              padding: "16px",
              color: "#FFF",
              fontSize: "14px",
              fontWeight: 700,
              cursor: status ? "pointer" : "not-allowed",
              fontFamily: "DM Mono, monospace",
              letterSpacing: "0.05em",
            }}
          >
            {loading ? "LOGGING..." : "LOG CALL"}
          </button>
        </>
      )}
    </div>
  );
}
