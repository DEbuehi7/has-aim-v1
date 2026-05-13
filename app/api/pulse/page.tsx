"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

const PLANET_COLORS = {
  Sonthera: { primary: "#FF006E", secondary: "#FF5BB5", bg: "#1A0010" },
  REye:     { primary: "#00E5FF", secondary: "#90E0EF", bg: "#001A1F" },
  LAP:      { primary: "#E63946", secondary: "#FF6B6B", bg: "#1A0005" },
};

const PLANET_LORE = {
  Sonthera: "Combat civilization. Arena tournaments. Underground betting. Antifragile — grows stronger under stress.",
  REye:     "Surveillance intelligence world. Data brokers, signal hunters, information warfare. Every node sees everything.",
  LAP:      "Los Angeles Parallax. Mirror world of SELA. Distressed multifamily, DSA signals, planetary real estate intelligence.",
};

export default function PulsePage() {
  const [planets, setPlanets] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("world");

  useEffect(() => {
    fetch("/api/pulse/planets")
      .then(r => r.json())
      .then(d => {
        setPlanets(Array.isArray(d.planets) ? d.planets : []);
        setCharacters(Array.isArray(d.characters) ? d.characters : []);
        if (d.planets?.length > 0) setSelected(d.planets[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const planet = selected;
  const colors = planet ? (PLANET_COLORS[planet.name] ?? { primary: "#6C5CE7", secondary: "#A29BFE", bg: "#0A0010" }) : null;
  const planetChars = characters.filter(c => c.planet_id === planet?.id);

  return (
    <div style={{ minHeight: "100vh", background: "#060608", color: "#E8E8F0", fontFamily: "DM Mono, monospace" }}>

      <div style={{ background: "#0D0D0F", borderBottom: "1px solid #1A1A2E", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", marginBottom: "4px" }}>
            AIMEDIA PULSE
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#FFF", letterSpacing: "-0.02em" }}>
            PLANETARY CONTENT ENGINE
          </div>
        </div>
        <div style={{ fontSize: "9px", color: "#333", letterSpacing: "0.15em" }}>
          SBI CAPITAL · HANWA INNOVATION SOLUTIONS
        </div>
      </div>

      <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>

        {loading ? (
          <div style={{ color: "#444", fontSize: "12px", padding: "40px 0" }}>Loading planets...</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
              {planets.map(p => {
                const c = PLANET_COLORS[p.name] ?? { primary: "#6C5CE7", secondary: "#A29BFE", bg: "#0A0010" };
                const isSelected = selected?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => { setSelected(p); setActiveTab("world"); }}
                    style={{
                      background: isSelected ? c.bg : "#0D0D0F",
                      border: "1px solid " + (isSelected ? c.primary + "80" : "#1A1A2E"),
                      borderTop: "3px solid " + (isSelected ? c.primary : "#1A1A2E"),
                      borderRadius: "6px",
                      padding: "18px 20px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                      boxShadow: isSelected ? "0 0 24px " + c.primary + "20" : "none",
                    }}
                  >
                    <div style={{ fontSize: "9px", color: c.secondary, letterSpacing: "0.2em", marginBottom: "6px", textTransform: "uppercase" }}>
                      {p.status ?? "ACTIVE"}
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#FFF", marginBottom: "8px" }}>{p.name}</div>
                    <div style={{ fontSize: "10px", color: "#666", lineHeight: 1.6 }}>
                      {PLANET_LORE[p.name] ?? p.description}
                    </div>
                  </button>
                );
              })}
            </div>

            {planet && colors && (
              <div style={{ background: "#0D0D0F", border: "1px solid " + colors.primary + "30", borderRadius: "8px", overflow: "hidden" }}>

                <div style={{ borderBottom: "1px solid #1A1A2E", display: "flex" }}>
                  {["world", "characters", "content", "intel"].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        background: "transparent",
                        border: "none",
                        borderBottom: "2px solid " + (activeTab === tab ? colors.primary : "transparent"),
                        padding: "12px 20px",
                        cursor: "pointer",
                        fontSize: "9px",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: activeTab === tab ? colors.primary : "#555",
                        fontFamily: "DM Mono, monospace",
                      }}
                    >{tab}</button>
                  ))}
                </div>

                <div style={{ padding: "24px" }}>

                  {activeTab === "world" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div>
                        <div style={{ fontSize: "9px", color: colors.secondary, letterSpacing: "0.2em", marginBottom: "8px" }}>
                          WORLD BRIEF — {planet.name.toUpperCase()}
                        </div>
                        <div style={{ fontSize: "13px", color: "#CCC", lineHeight: 1.8 }}>
                          {planet.description}
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                        {[
                          { label: "Characters", value: planetChars.length },
                          { label: "Status", value: planet.status ?? "ACTIVE" },
                          { label: "Platform", value: "AIMedia Pulse" },
                        ].map(s => (
                          <div key={s.label} style={{ background: "#141416", border: "1px solid #1A1A2E", borderRadius: "4px", padding: "12px" }}>
                            <div style={{ fontSize: "8px", color: "#444", letterSpacing: "0.12em", marginBottom: "4px" }}>{s.label}</div>
                            <div style={{ fontSize: "13px", fontWeight: 700, color: colors.primary }}>{s.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "characters" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ fontSize: "9px", color: colors.secondary, letterSpacing: "0.2em", marginBottom: "4px" }}>
                        CHARACTERS — {planet.name.toUpperCase()}
                      </div>
                      {planetChars.length === 0 ? (
                        <div style={{ color: "#333", fontSize: "11px" }}>No characters seeded yet.</div>
                      ) : planetChars.map(c => (
                        <div key={c.id} style={{ background: "#141416", border: "1px solid " + colors.primary + "30", borderLeft: "3px solid " + colors.primary, borderRadius: "4px", padding: "14px" }}>
                          <div style={{ fontSize: "12px", fontWeight: 700, color: "#FFF", marginBottom: "4px" }}>{c.name}</div>
                          <div style={{ fontSize: "11px", color: "#777", lineHeight: 1.6 }}>{c.description}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "content" && (
                    <div style={{ color: "#333", fontSize: "11px" }}>
                      Content pipeline — V2V synthesis queue coming in Sprint 6.
                    </div>
                  )}

                  {activeTab === "intel" && (
                    <div style={{ color: "#333", fontSize: "11px" }}>
                      Planet intelligence feed — AIM Anomaly OS integration coming in Sprint 6.
                    </div>
                  )}

                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
