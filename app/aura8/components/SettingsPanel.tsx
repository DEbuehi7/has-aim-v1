"use client";
import { useEffect, useState } from "react";

interface Preferences {
  categories: string[];
  safetyLevel: "standard" | "mature" | "explicit";
  notifications: {
    email: boolean;
    newContent: boolean;
    updates: boolean;
  };
  privacy: {
    analytics: boolean;
    personalization: boolean;
  };
}

const DEFAULT_PREFS: Preferences = {
  categories: [],
  safetyLevel: "standard",
  notifications: { email: true, newContent: true, updates: false },
  privacy: { analytics: true, personalization: true },
};

const CATEGORIES = [
  "Romance", "Adventure", "Fantasy", "Companionship", "Classic",
  "Wellness", "Conversation", "Creative",
];

interface SettingsPanelProps {
  email: string | null;
  onLogout: () => void;
}

export default function SettingsPanel({ email, onLogout }: SettingsPanelProps) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/aura8/user/profile", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.preferences) {
          setPrefs({ ...DEFAULT_PREFS, ...data.preferences });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleCategory = (cat: string) => {
    setPrefs(p => ({
      ...p,
      categories: p.categories.includes(cat)
        ? p.categories.filter(c => c !== cat)
        : [...p.categories, cat],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/aura8/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ preferences: prefs }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
        <div style={{ fontSize: "10px", color: "#FF006E", letterSpacing: "0.2em", fontFamily: "DM Mono, monospace" }}>LOADING...</div>
      </div>
    );
  }

  const sectionStyle: React.CSSProperties = {
    background: "#0D0D0F",
    border: "1px solid #27272A",
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "20px",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "10px",
    color: "#FF006E",
    letterSpacing: "0.15em",
    fontWeight: 700,
    marginBottom: "16px",
    fontFamily: "DM Mono, monospace",
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #1A1A2E",
  };

  return (
    <div style={{ maxWidth: "640px", width: "100%", fontFamily: "DM Mono, monospace" }}>

      {/* Profile Section */}
      <div style={sectionStyle}>
        <div style={labelStyle}>ACCOUNT PROFILE</div>
        <div style={rowStyle}>
          <div>
            <div style={{ fontSize: "11px", color: "#9A9A9F", marginBottom: "2px" }}>Email Address</div>
            <div style={{ fontSize: "13px", color: "#E8E8F0" }}>{email ?? "—"}</div>
          </div>
          <div style={{
            background: "#FF006E20",
            border: "1px solid #FF006E40",
            borderRadius: "4px",
            padding: "4px 8px",
            fontSize: "9px",
            color: "#FF006E",
            fontWeight: 700,
            letterSpacing: "0.1em",
          }}>
            VERIFIED
          </div>
        </div>
        <div style={{ ...rowStyle, border: "none", paddingBottom: 0 }}>
          <div style={{ fontSize: "11px", color: "#9A9A9F" }}>Member Since</div>
          <div style={{ fontSize: "12px", color: "#E8E8F0" }}>Active Member</div>
        </div>
      </div>

      {/* Content Preferences */}
      <div style={sectionStyle}>
        <div style={labelStyle}>CONTENT PREFERENCES</div>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", color: "#9A9A9F", marginBottom: "10px" }}>Categories</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {CATEGORIES.map(cat => {
              const active = prefs.categories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  style={{
                    background: active ? "#FF006E20" : "transparent",
                    border: active ? "1px solid #FF006E" : "1px solid #27272A",
                    borderRadius: "4px",
                    padding: "6px 12px",
                    color: active ? "#FF006E" : "#9A9A9F",
                    fontSize: "10px",
                    fontWeight: active ? 700 : 400,
                    cursor: "pointer",
                    fontFamily: "DM Mono, monospace",
                    letterSpacing: "0.05em",
                    transition: "all 0.15s",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
        <div style={rowStyle}>
          <div style={{ fontSize: "11px", color: "#9A9A9F" }}>Safety Level</div>
          <select
            value={prefs.safetyLevel}
            onChange={e => setPrefs(p => ({ ...p, safetyLevel: e.target.value as Preferences["safetyLevel"] }))}
            style={{
              background: "#060608",
              border: "1px solid #27272A",
              borderRadius: "4px",
              padding: "6px 10px",
              color: "#E8E8F0",
              fontSize: "11px",
              fontFamily: "DM Mono, monospace",
              cursor: "pointer",
            }}
          >
            <option value="standard">Standard</option>
            <option value="mature">Mature (18+)</option>
            <option value="explicit">Explicit (18+)</option>
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div style={sectionStyle}>
        <div style={labelStyle}>NOTIFICATIONS</div>
        {(
          [
            { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
            { key: "newContent", label: "New Content Alerts", desc: "Get notified when new content drops" },
            { key: "updates", label: "Platform Updates", desc: "News about Aura8 features" },
          ] as const
        ).map(({ key, label, desc }) => (
          <div key={key} style={key === "updates" ? { ...rowStyle, border: "none", paddingBottom: 0 } : rowStyle}>
            <div>
              <div style={{ fontSize: "12px", color: "#E8E8F0" }}>{label}</div>
              <div style={{ fontSize: "10px", color: "#52525B", marginTop: "2px" }}>{desc}</div>
            </div>
            <button
              onClick={() => setPrefs(p => ({
                ...p,
                notifications: { ...p.notifications, [key]: !p.notifications[key] },
              }))}
              style={{
                width: "44px",
                height: "24px",
                borderRadius: "12px",
                background: prefs.notifications[key] ? "#FF006E" : "#27272A",
                border: "none",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              <div style={{
                position: "absolute",
                top: "3px",
                left: prefs.notifications[key] ? "23px" : "3px",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: "#FFF",
                transition: "left 0.2s",
              }} />
            </button>
          </div>
        ))}
      </div>

      {/* Privacy */}
      <div style={sectionStyle}>
        <div style={labelStyle}>PRIVACY CONTROLS</div>
        {(
          [
            { key: "analytics", label: "Usage Analytics", desc: "Help improve Aura8 with anonymous data" },
            { key: "personalization", label: "Personalization", desc: "Tailor content based on your activity" },
          ] as const
        ).map(({ key, label, desc }) => (
          <div key={key} style={key === "personalization" ? { ...rowStyle, border: "none", paddingBottom: 0 } : rowStyle}>
            <div>
              <div style={{ fontSize: "12px", color: "#E8E8F0" }}>{label}</div>
              <div style={{ fontSize: "10px", color: "#52525B", marginTop: "2px" }}>{desc}</div>
            </div>
            <button
              onClick={() => setPrefs(p => ({
                ...p,
                privacy: { ...p.privacy, [key]: !p.privacy[key] },
              }))}
              style={{
                width: "44px",
                height: "24px",
                borderRadius: "12px",
                background: prefs.privacy[key] ? "#FF006E" : "#27272A",
                border: "none",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              <div style={{
                position: "absolute",
                top: "3px",
                left: prefs.privacy[key] ? "23px" : "3px",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: "#FFF",
                transition: "left 0.2s",
              }} />
            </button>
          </div>
        ))}
      </div>

      {/* Save + Logout */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "40px" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: 1,
            background: saved ? "#10B98120" : "#FF006E",
            border: saved ? "1px solid #10B981" : "none",
            borderRadius: "6px",
            padding: "14px 24px",
            color: saved ? "#10B981" : "#FFF",
            fontSize: "12px",
            fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "DM Mono, monospace",
            letterSpacing: "0.08em",
            transition: "all 0.2s",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "SAVING..." : saved ? "✓ SAVED" : "SAVE PREFERENCES"}
        </button>
        <button
          onClick={onLogout}
          style={{
            background: "transparent",
            border: "1px solid #27272A",
            borderRadius: "6px",
            padding: "14px 20px",
            color: "#9A9A9F",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "DM Mono, monospace",
            letterSpacing: "0.08em",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#EF4444"; (e.currentTarget as HTMLButtonElement).style.color = "#EF4444"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#27272A"; (e.currentTarget as HTMLButtonElement).style.color = "#9A9A9F"; }}
        >
          LOGOUT
        </button>
      </div>
    </div>
  );
}
