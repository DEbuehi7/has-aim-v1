"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const STATUSES = ["NEW","CALLED","VOICEMAIL","CALLBACK","INTERESTED","NOT_INTERESTED","DNC"];

const SCRIPT = {
  intro: function(name) {
    return "Hi, may I speak with " + name + "? My name is Daniel with AIM Capital. I am reaching out because we work with property owners in your area and I wanted to have a quick conversation about your property.";
  },
  pitch: "We have been helping owners in similar situations explore their options, whether that is selling, refinancing, or just understanding what the property is worth today. Would you be open to a 5-minute conversation?",
  voicemail: function(name) {
    return "Hi " + name + ", this is Daniel with AIM Capital. I am reaching out about your property and wanted to connect. Please call me back at 323-689-4495. Thank you.";
  },
  objection_not_selling: "Totally understand. I am not here to pressure you at all. We work with a lot of owners who are not actively looking to sell but find it valuable to know their options. Would it be okay if I followed up in a few months?",
  objection_not_interested: "No problem at all. I appreciate your time. Have a great day.",
};

export default function CallScriptPage() {
  const { id } = useParams();
  const router = useRouter();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("NEW");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/contacts")
      .then(r => r.json())
      .then(function(data) {
        const c = data.find(function(x) { return x.id === Number(id); });
        if (c) { setContact(c); setNotes(c.notes ?? ""); setStatus(c.status ?? "NEW"); }
        setLoading(false);
      })
      .catch(function() { setLoading(false); });
  }, [id]);

  const handleSave = async function() {
    if (!contact) return;
    setSaving(true);
    await fetch("/api/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: contact.id,
        status: status,
        notes: notes,
        call_attempts: (contact.call_attempts ?? 0) + 1,
        last_called_at: new Date().toISOString(),
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(function() { setSaved(false); router.push("/contacts"); }, 1200);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#09090B", color: "#71717A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Mono, monospace" }}>
      Loading...
    </div>
  );

  if (!contact) return (
    <div style={{ minHeight: "100vh", background: "#09090B", color: "#71717A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Mono, monospace" }}>
      Contact not found.
    </div>
  );

  const firstName = contact.full_name ? contact.full_name.split(" ")[0] : "there";

  return (
    <div style={{ minHeight: "100vh", background: "#09090B", color: "#E4E4E7", fontFamily: "DM Mono, monospace", padding: "24px" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={function() { router.push("/contacts"); }} style={{ background: "transparent", border: "none", color: "#71717A", fontSize: "12px", cursor: "pointer", fontFamily: "DM Mono, monospace" }}>
            Back to Contacts
          </button>
          <span style={{ fontSize: "10px", color: "#52525B" }}>Call #{(contact.call_attempts ?? 0) + 1}</span>
        </div>

        <div style={{ background: "#18181B", border: "1px solid #27272A", borderRadius: "8px", padding: "20px" }}>
          <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#FAFAFA", marginBottom: "4px" }}>{contact.full_name}</h1>
          <p style={{ fontSize: "11px", color: "#71717A", marginBottom: "16px" }}>
            {contact.role ?? "OWNER"}{contact.mailing_address ? " -- " + contact.mailing_address : ""}
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <a href={"tel:" + contact.phone_primary} style={{
              background: "#14532D", color: "#86EFAC", padding: "10px 18px",
              borderRadius: "6px", fontWeight: 600, fontSize: "13px", textDecoration: "none",
            }}>
              Call {contact.phone_primary ?? "--"}
            </a>
            {contact.email && (
              <a href={"mailto:" + contact.email} style={{
                background: "#27272A", color: "#A1A1AA", padding: "10px 18px",
                borderRadius: "6px", fontSize: "13px", textDecoration: "none",
              }}>Email</a>
            )}
          </div>
          {contact.dnc && (
            <p style={{ marginTop: "12px", color: "#F87171", fontSize: "11px", fontWeight: 600 }}>
              WARNING: DO NOT CALL -- DNC flag active
            </p>
          )}
        </div>

        <div style={{ background: "#18181B", border: "1px solid #27272A", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h2 style={{ fontSize: "10px", color: "#71717A", letterSpacing: "0.15em", textTransform: "uppercase" }}>Call Script</h2>
          {[
            ["INTRO", SCRIPT.intro(firstName)],
            ["PITCH", SCRIPT.pitch],
            ["VOICEMAIL", SCRIPT.voicemail(firstName)],
            ["OBJECTION -- NOT SELLING", SCRIPT.objection_not_selling],
            ["OBJECTION -- NOT INTERESTED", SCRIPT.objection_not_interested],
          ].map(function(item) {
            return (
              <div key={item[0]}>
                <p style={{ fontSize: "9px", color: "#52525B", letterSpacing: "0.12em", marginBottom: "6px" }}>{item[0]}</p>
                <p style={{ fontSize: "13px", color: "#C8C8CC", lineHeight: 1.8 }}>{item[1]}</p>
              </div>
            );
          })}
        </div>

        <div style={{ background: "#18181B", border: "1px solid #27272A", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h2 style={{ fontSize: "10px", color: "#71717A", letterSpacing: "0.15em", textTransform: "uppercase" }}>Log Outcome</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {STATUSES.map(function(s) {
              return (
                <button key={s} onClick={function() { setStatus(s); }} style={{
                  background: status === s ? "#FAFAFA" : "#27272A",
                  color: status === s ? "#09090B" : "#A1A1AA",
                  border: "1px solid " + (status === s ? "#FAFAFA" : "#3F3F46"),
                  borderRadius: "6px", padding: "6px 12px", fontSize: "11px",
                  cursor: "pointer", fontFamily: "DM Mono, monospace",
                }}>{s}</button>
              );
            })}
          </div>
          <textarea
            value={notes}
            onChange={function(e) { setNotes(e.target.value); }}
            placeholder="Notes from this call..."
            rows={4}
            style={{
              width: "100%", background: "#27272A", border: "1px solid #3F3F46",
              borderRadius: "6px", padding: "10px 14px", fontSize: "13px",
              color: "#E4E4E7", fontFamily: "DM Mono, monospace", resize: "none", outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button onClick={handleSave} disabled={saving || saved} style={{
            width: "100%", background: saved ? "#14532D" : "#FAFAFA",
            color: saved ? "#86EFAC" : "#09090B",
            border: "none", borderRadius: "6px", padding: "12px",
            fontSize: "13px", fontWeight: 700, cursor: saving || saved ? "not-allowed" : "pointer",
            fontFamily: "DM Mono, monospace", letterSpacing: "0.05em",
          }}>
            {saved ? "Saved -- returning..." : saving ? "Saving..." : "Save and Return to Contacts"}
          </button>
        </div>

      </div>
    </div>
  );
}