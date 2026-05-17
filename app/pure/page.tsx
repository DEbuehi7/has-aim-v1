“use client”;
export const dynamic = “force-dynamic”;

import { useEffect, useState } from “react”;

const C = {
b0:”#060608”, b1:”#0D0D0F”, b2:”#141416”, b3:”#1C1C1F”, b4:”#252528”,
b5:”#323235”, b6:”#4A4A4E”, b7:”#6E6E73”, b8:”#9A9A9F”, b9:”#C8C8CC”, b10:”#EBEBEF”,
EN:”#F59E0B”, DT:”#3B82F6”, NV:”#22C55E”, ST:”#A855F7”,
SR:”#F97316”, HV:”#06B6D4”, SN:”#C8A96E”, WN:”#EF4444”,
RL:”#EC4899”, DK:”#F59E0B”, EN2:”#10B981”, BZ:”#3B82F6”,
TR:”#8B5CF6”, SC:”#F97316”, SH:”#06B6D4”, FA:”#A855F7”,
PT:”#EF4444”, MN:”#22C55E”, WL:”#F59E0B”, HH:”#C8A96E”, SP:”#EC4899”,
};

const FM = “DM Mono, monospace”;
const FD = “Syne, sans-serif”;

const NODES = [
{ id:“LAX”, flag:“US”, city:“Baldwin Hills”,    region:“Los Angeles, CA”, nc:C.SN },
{ id:“ADD”, flag:“ET”, city:“Bole District”,    region:“Addis Ababa, ET”, nc:C.EN },
{ id:“LOS”, flag:“NG”, city:“Lekki Phase 1”,    region:“Lagos, NG”,       nc:C.DT },
{ id:“DPS”, flag:“ID”, city:“Pererenan”,         region:“Bali, ID”,        nc:C.ST },
{ id:“29P”, flag:“US”, city:“Twentynine Palms”, region:“CA High Desert”,  nc:C.SR },
];

const MAIN_TABS = [
{ id:“sentinel”,   label:“Sentinel”,   ac:C.WN  },
{ id:“properties”, label:“Properties”, ac:C.SN  },
{ id:“compliance”, label:“Compliance”, ac:C.WN  },
{ id:“capital”,    label:“Capital”,    ac:C.EN  },
{ id:“life”,       label:“Life OS”,    ac:C.RL  },
{ id:“health”,     label:“Health”,     ac:C.NV  },
];

const LIFE_TABS = [
{ id:“rl”, label:“Relationships”, ac:C.RL },
{ id:“dk”, label:“Daily Tasks”,   ac:C.DK },
{ id:“bz”, label:“Business”,      ac:C.BZ },
{ id:“mn”, label:“Money”,         ac:C.MN },
{ id:“wl”, label:“Wellness”,      ac:C.WL },
{ id:“pt”, label:“Protection”,    ac:C.PT },
{ id:“hh”, label:“Household”,     ac:C.HH },
{ id:“tr”, label:“Transport”,     ac:C.TR },
{ id:“sc”, label:“Social”,        ac:C.SC },
{ id:“en”, label:“Entertainment”, ac:C.EN2 },
{ id:“sh”, label:“Shopping”,      ac:C.SH },
{ id:“fa”, label:“Fashion”,       ac:C.FA },
{ id:“sp”, label:“Spiritual”,     ac:C.SP },
];

const LIFE_DATA = {
rl: { label:“Relationships”, color:C.RL, sections:[
{ title:“Partnership”, items:[
{ k:“PARTNER”, v:“Committed closed-loop relationship. Woldesemayat. Mutual financial transparency.” },
{ k:“LEGAL”, v:“Prenuptial agreement as standard operating procedure. Insulates entity stack.” },
]},
{ title:“Family”, items:[
{ k:“EXTENDED”, v:“Closed loop engagement. Structured family meetings.” },
{ k:“CHILDREN”, v:“Decision mutual. Both adoption and biological options open.” },
]},
]},
dk: { label:“Daily Tasks”, color:C.DK, sections:[
{ title:“Morning Protocol”, items:[
{ k:“BRIEF”, v:“3-line session brief before opening laptop. One goal per session.” },
{ k:“PHYSICAL”, v:“Stretch / mobility / walk. 6ft 4in 350lb frame — joint preservation priority.” },
]},
{ title:“Operations Stack”, items:[
{ k:“PLATFORM”, v:“HAS / Sentinel sprint. AIM Anomaly OS check. AIMedia Pulse queue.” },
{ k:“PROPERTY”, v:“Weldon + Simone daily check: eviction pipeline, abatement status, HAP holds.” },
{ k:“EDO”, v:“Execute / Delegate / Outsource. No unvetted inbound.” },
]},
{ title:“EOD Review”, items:[
{ k:“REVIEW”, v:“Did today’s session achieve its single goal? Binary yes/no.” },
{ k:“WIND DOWN”, v:“No blue light after 21:00 (canonical rule). Sonos ambient.” },
]},
]},
bz: { label:“Business”, color:C.BZ, sections:[
{ title:“Entity Stack”, items:[
{ k:“SBI CAPITAL”, v:“Smiling Bubbles Inc. C-Corp parent. EIN 42-2492333.” },
{ k:“AIM LLC”, v:“OS / revenue layer. Operating entity for platform revenue.” },
{ k:“HANWA”, v:“Hanwa Innovation Solutions LLC. R&D / engineering / capital deployment.” },
]},
{ title:“Active Platforms”, items:[
{ k:“HAS / SENTINEL”, v:“Housing Autonomy System. 10,000 distressed multifamily units. SE LA.” },
{ k:“AIMEDIA PULSE”, v:“Planetary content engine. Sonthera, REye, LAP.” },
{ k:“AIM ANOMALY OS”, v:“22-vertical intelligence shell. Claude / GPT / Gemini tripartite router.” },
{ k:“AURA8”, v:“Adult content platform. Apollonian Grid. Privacy, discretion, Dosa identity.” },
]},
]},
mn: { label:“Money”, color:C.MN, sections:[
{ title:“Capital Architecture”, items:[
{ k:“PRINCIPLE”, v:“The algorithm is the asset. The capital is just its fuel.” },
{ k:“EIN”, v:“42-2492333 — Smiling Bubbles Inc. DBA SBI Capital.” },
{ k:“MERCURY”, v:“Acquisition Reserve open. First capital node. $500 seed.” },
]},
{ title:“Revenue Streams”, items:[
{ k:“ACTIVE”, v:“KW SELA commissions. Property management fees. Drone photography.” },
{ k:“PLATFORM”, v:“HAS licensing. AIM OS subscriptions. AIMedia. Aura8.” },
]},
]},
wl: { label:“Wellness”, color:C.WL, sections:[
{ title:“Metabolic Protocol”, items:[
{ k:“BLOOD SUGAR”, v:“Monitor: before breakfast Mon, 2hr after breakfast Tue, before dinner Wed/Thu.” },
{ k:“TARGETS”, v:“BS 120 target. BP 140/90 monitored.” },
{ k:“AVOID”, v:“Processed food (canonical rule). Sugar. White bread.” },
]},
]},
pt: { label:“Protection”, color:C.PT, sections:[
{ title:“Legal Shield”, items:[
{ k:“ENTITY STACK”, v:“SBI to AIM LLC to HIS [Property] LLCs. Own nothing personally.” },
{ k:“IP”, v:“Provisional patents on DSA v2, AIM Anomaly OS routing.” },
]},
{ title:“Cybersecurity”, items:[
{ k:“IDENTITIES”, v:“AIM: EDOAIM2030@pm.me. HAS: EDOHAS2030@pm.me. Aura8: EDOAURA8@pm.me.” },
{ k:“ZEROTRUST”, v:“Hardware-locked security. No cloud access without endpoint validation.” },
]},
]},
hh: { label:“Household”, color:C.HH, sections:[
{ title:“Smart Systems”, items:[
{ k:“NETWORK”, v:“UniFi Dream Machine Pro SE. 3x U6 Lite APs. BLE beacon mesh.” },
{ k:“ENERGY”, v:“EcoFlow DELTA Pro 7.2kWh. Solar + grid hybrid.” },
]},
]},
tr: { label:“Transportation”, color:C.TR, sections:[
{ title:“Drone Fleet”, items:[
{ k:“SCOUT DRONE”, v:“DJI Matrice 350 RTK ~$6,500. Platform selection pending.” },
{ k:“RE DRONE”, v:“DJI Mini Pro 3 current. FAA Remote Pilot #4229607.” },
]},
]},
sc: { label:“Social”, color:C.SC, sections:[
{ title:“Identity”, items:[
{ k:“AIM IDENTITY”, v:“Daniel Ebuehi — HAS, AIM, KW contexts.” },
{ k:“DOSA IDENTITY”, v:“Dosa — AIMature / Aura8 / anonymity contexts.” },
]},
]},
en: { label:“Entertainment”, color:C.EN2, sections:[
{ title:“Media”, items:[
{ k:“STREAMING”, v:“Hulu, Netflix, Disney+. BKFC, NFL, Combat Sports, Anime.” },
{ k:“CREATIVE”, v:“Real estate photography. Drone cinematography. Rhino/Grasshopper.” },
]},
]},
sh: { label:“Shopping”, color:C.SH, sections:[
{ title:“Value Rules”, items:[
{ k:“IKEA SEKTION”, v:“Beats custom cabinetry by $8,000-$15,000.” },
{ k:“ECOFLOW”, v:“Over Tesla Powerwall — same capacity, $4,000 cheaper.” },
]},
]},
fa: { label:“Fashion”, color:C.FA, sections:[
{ title:“Seamless Threads”, items:[
{ k:“CONCEPT”, v:“Simulation-driven surface system. Thread agent physics.” },
{ k:“BODY SPEC”, v:“Bust/Chest: 66. Sleeve: 39. 6ft 4in 350lb frame.” },
]},
]},
sp: { label:“Spiritual”, color:C.SP, sections:[
{ title:“Core Beliefs”, items:[
{ k:“FAITH”, v:“Christian foundation. God is my Judge. God Did It. Avec Dieu.” },
{ k:“PURPOSE”, v:“EDO — Execute, Delegate, Outsource. Ebuehi Daniel Osazee.” },
{ k:“LEGACY”, v:“Beach town to Benin City to Country of Benin to Global Empire.” },
]},
]},
};

function LifeSection({ section }) {
const [open, setOpen] = useState(null);
return (
<div style={{ display:“flex”, flexDirection:“column”, gap:“6px” }}>
<div style={{ fontSize:“9px”, color:section.color, letterSpacing:“0.15em”, textTransform:“uppercase”, marginBottom:“4px”, fontFamily:FM }}>
{section.title}
</div>
{section.items.map((item, i) => (
<div key={i} onClick={() => setOpen(open === i ? null : i)} style={{
background: open === i ? section.color + “10” : “#1C1C1F”,
border:“1px solid “ + (open === i ? section.color + “50” : “#252528”),
borderLeft:“3px solid “ + (open === i ? section.color : “#323235”),
borderRadius:“3px”, padding:“8px 12px”, cursor:“pointer”,
}}>
<div style={{ display:“flex”, justifyContent:“space-between”, alignItems:“center” }}>
<div style={{ fontSize:“9px”, fontFamily:FM, color: open === i ? section.color : “#9A9A9F”, letterSpacing:“0.1em” }}>{item.k}</div>
<div style={{ fontSize:“9px”, color:”#4A4A4E” }}>{open === i ? “▲” : “▼”}</div>
</div>
{open === i && <div style={{ fontSize:“11px”, color:”#9A9A9F”, lineHeight:1.7, marginTop:“6px” }}>{item.v}</div>}
</div>
))}
</div>
);
}

export default function PurePage() {
const [nd, setNd] = useState(“LAX”);
const [mt, setMt] = useState(“sentinel”);
const [lt, setLt] = useState(“rl”);
const [health, setHealth] = useState([]);
const [contacts, setContacts] = useState([]);
const [deals, setDeals] = useState([]);
const [properties, setProperties] = useState([]);
const [units, setUnits] = useState([]);
const [compliance, setCompliance] = useState([]);
const [capital, setCapital] = useState([]);
const [treasury, setTreasury] = useState([]);
const [selectedProp, setSelectedProp] = useState(null);

const N = NODES.find(x => x.id === nd);
const LD = LIFE_DATA[lt];

useEffect(() => {
fetch(”/api/contacts”).then(r => r.json()).then(d => setContacts(Array.isArray(d) ? d : [])).catch(() => {});
fetch(”/api/deals”).then(r => r.json()).then(d => setDeals(Array.isArray(d) ? d : [])).catch(() => {});
fetch(”/api/pure/health”).then(r => r.json()).then(d => setHealth(Array.isArray(d) ? d : [])).catch(() => {});
fetch(”/api/pure/properties”).then(r => r.json()).then(d => {
setProperties(Array.isArray(d.properties) ? d.properties : []);
setUnits(Array.isArray(d.units) ? d.units : []);
setCompliance(Array.isArray(d.compliance) ? d.compliance : []);
setCapital(Array.isArray(d.capital) ? d.capital : []);
setTreasury(Array.isArray(d.treasury) ? d.treasury : []);
if (d.properties?.length > 0) setSelectedProp(d.properties[0]);
}).catch(() => {});
}, []);

const propUnits = selectedProp ? units.filter(u => u.property_id === selectedProp.id) : [];
const abatementUnits = propUnits.filter(u => u.tenant_status === “ABATEMENT”);
const evictionUnits = propUnits.filter(u => u.tenant_status === “EVICTION”);
const overdueCompliance = compliance.filter(c => c.submission_status === “PENDING” && new Date(c.due_date) < new Date());

const sentinelStats = [
{ label:“Contacts”,   value: contacts.length,                                      color:C.SN },
{ label:“Deals”,      value: deals.length,                                         color:C.EN },
{ label:“Interested”, value: contacts.filter(c => c.status === “INTERESTED”).length, color:C.NV },
{ label:“Properties”, value: properties.length,                                    color:C.HV },
{ label:“Abatements”, value: units.filter(u => u.tenant_status === “ABATEMENT”).length, color:C.WN },
{ label:“Evictions”,  value: units.filter(u => u.tenant_status === “EVICTION”).length,  color:C.WN },
];

return (
<div style={{ fontFamily:FM, background:”#0D0D0F”, color:”#C8C8CC”, minHeight:“100vh”, display:“flex”, flexDirection:“column” }}>

```
  <div style={{ background:"#141416", borderBottom:"1px solid #252528", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
    <div>
      <div style={{ fontFamily:FD, fontSize:"14px", fontWeight:800, letterSpacing:"0.08em", color:"#EBEBEF" }}>
        AIM PURE <span style={{ fontSize:"9px", fontWeight:400, color:C.SN, letterSpacing:"0.15em" }}>v1.1 — MASTER OS</span>
      </div>
      <div style={{ fontSize:"8px", color:"#6E6E73", letterSpacing:"0.15em", marginTop:"2px" }}>SBI CAPITAL — HANWA INNOVATION SOLUTIONS — CONFIDENTIAL</div>
    </div>
    <div style={{ display:"flex", gap:"4px", flexWrap:"wrap" }}>
      {NODES.map(n => (
        <button key={n.id} onClick={() => setNd(n.id)} style={{
          background: nd===n.id ? n.nc + "20" : "transparent",
          border:"1px solid " + (nd===n.id ? n.nc + "80" : "#252528"),
          color: nd===n.id ? n.nc : "#6E6E73",
          padding:"5px 10px", borderRadius:"2px", cursor:"pointer", fontSize:"9px", letterSpacing:"0.1em",
        }}>{n.flag} {n.id}</button>
      ))}
    </div>
  </div>

  <div style={{ background:"#141416", borderBottom:"1px solid #252528", padding:"0 24px", display:"flex", overflowX:"auto" }}>
    {MAIN_TABS.map(t => (
      <button key={t.id} onClick={() => setMt(t.id)} style={{
        background:"transparent", border:"none", cursor:"pointer",
        borderBottom:"3px solid " + (mt===t.id ? t.ac : "transparent"),
        padding:"12px 18px", marginBottom:"-1px", whiteSpace:"nowrap",
        fontSize:"10px", letterSpacing:"0.14em", textTransform:"uppercase",
        color: mt===t.id ? t.ac : "#6E6E73", fontFamily:FM,
      }}>{t.label}</button>
    ))}
  </div>

  {mt === "life" && (
    <div style={{ background:"#141416", borderBottom:"1px solid #252528", padding:"0 24px", display:"flex", overflowX:"auto" }}>
      {LIFE_TABS.map(t => (
        <button key={t.id} onClick={() => setLt(t.id)} style={{
          background:"transparent", border:"none", cursor:"pointer",
          borderBottom:"2px solid " + (lt===t.id ? t.ac : "transparent"),
          padding:"10px 14px", marginBottom:"-1px", whiteSpace:"nowrap",
          fontSize:"9px", letterSpacing:"0.12em", textTransform:"uppercase",
          color: lt===t.id ? t.ac : "#6E6E73", fontFamily:FM,
        }}>{t.label}</button>
      ))}
    </div>
  )}

  <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>

    {mt === "sentinel" && (
      <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
        <div style={{ fontSize:"10px", color:C.WN, letterSpacing:"0.15em" }}>SENTINEL DASHBOARD — LIVE</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"8px" }}>
          {sentinelStats.map(s => (
            <div key={s.label} style={{ background:"#141416", border:"1px solid #252528", borderLeft:"3px solid " + s.color, borderRadius:"3px", padding:"14px" }}>
              <div style={{ fontSize:"8px", color:"#6E6E73", letterSpacing:"0.12em", marginBottom:"4px" }}>{s.label}</div>
              <div style={{ fontFamily:FD, fontSize:"24px", fontWeight:800, color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
        {overdueCompliance.length > 0 && (
          <div style={{ background:C.WN + "10", border:"1px solid " + C.WN + "40", borderRadius:"4px", padding:"14px" }}>
            <div style={{ fontSize:"9px", color:C.WN, letterSpacing:"0.15em", marginBottom:"8px" }}>COMPLIANCE ALERTS</div>
            {overdueCompliance.map(c => (
              <div key={c.id} style={{ fontSize:"11px", color:"#C8C8CC", marginBottom:"4px" }}>
                {c.jurisdiction} — {c.deadline_type} — Due {c.due_date} — {c.responsible_party}
              </div>
            ))}
          </div>
        )}
        <div style={{ background:"#141416", border:"1px solid #252528", borderRadius:"3px", padding:"14px" }}>
          <div style={{ fontSize:"9px", color:C.SN, letterSpacing:"0.15em", marginBottom:"10px" }}>RECENT CONTACTS</div>
          {contacts.slice(0, 5).map(c => (
            <div key={c.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #1C1C1F", fontSize:"11px" }}>
              <span style={{ color:"#C8C8CC" }}>{c.full_name}</span>
              <span style={{ color:"#6E6E73" }}>{c.phone_primary ?? "--"}</span>
              <span style={{ color: c.status === "INTERESTED" ? C.NV : "#6E6E73", fontSize:"9px" }}>{c.status ?? "NEW"}</span>
            </div>
          ))}
          {contacts.length === 0 && <div style={{ color:"#4A4A4E", fontSize:"11px" }}>No contacts yet.</div>}
        </div>
      </div>
    )}

    {mt === "properties" && (
      <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
        <div style={{ fontSize:"10px", color:C.SN, letterSpacing:"0.15em" }}>PROPERTIES — LIVE</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:"8px" }}>
          {properties.map(p => (
            <button key={p.id} onClick={() => setSelectedProp(p)} style={{
              background: selectedProp?.id === p.id ? C.SN + "10" : "#141416",
              border:"1px solid " + (selectedProp?.id === p.id ? C.SN + "60" : "#252528"),
              borderLeft:"3px solid " + (selectedProp?.id === p.id ? C.SN : "#323235"),
              borderRadius:"3px", padding:"14px", textAlign:"left", cursor:"pointer",
            }}>
              <div style={{ fontSize:"10px", color:"#EBEBEF", fontWeight:700, marginBottom:"4px" }}>{p.address}</div>
              <div style={{ fontSize:"9px", color:C.SN, marginBottom:"2px" }}>{p.entity_ownership} — {p.unit_count} units</div>
              <div style={{ fontSize:"9px", color:"#6E6E73" }}>HIMS: {p.hims_id} — {p.status}</div>
            </button>
          ))}
        </div>
        {selectedProp && (
          <div style={{ background:"#141416", border:"1px solid #252528", borderRadius:"3px", padding:"14px" }}>
            <div style={{ fontSize:"10px", color:C.SN, letterSpacing:"0.15em", marginBottom:"12px" }}>{selectedProp.address}</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"8px", marginBottom:"12px" }}>
              {[
                { label:"Total Units", value: selectedProp.unit_count, color:C.SN },
                { label:"Abatements",  value: abatementUnits.length,   color:C.WN },
                { label:"Evictions",   value: evictionUnits.length,    color:C.WN },
              ].map(s => (
                <div key={s.label} style={{ background:"#1C1C1F", borderRadius:"3px", padding:"10px" }}>
                  <div style={{ fontSize:"8px", color:"#6E6E73", marginBottom:"4px" }}>{s.label}</div>
                  <div style={{ fontSize:"18px", fontWeight:800, color:s.color, fontFamily:FD }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:"9px", color:"#6E6E73", letterSpacing:"0.12em", marginBottom:"8px" }}>TRACKED UNITS</div>
            {propUnits.map(u => (
              <div key={u.id} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #1C1C1F", fontSize:"10px" }}>
                <span style={{ color:"#C8C8CC" }}>Unit {u.unit_number}</span>
                <span style={{ color: u.tenant_status === "ABATEMENT" ? C.WN : u.tenant_status === "EVICTION" ? C.WN : C.NV, fontSize:"9px" }}>{u.tenant_status}</span>
                <span style={{ color:"#6E6E73", fontSize:"9px" }}>{u.notes ?? "--"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {mt === "compliance" && (
      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        <div style={{ fontSize:"10px", color:C.WN, letterSpacing:"0.15em" }}>COMPLIANCE DEADLINES — LIVE</div>
        {compliance.map(c => (
          <div key={c.id} style={{
            background:"#141416",
            border:"1px solid " + (c.submission_status === "PENDING" ? C.WN + "40" : C.NV + "40"),
            borderLeft:"3px solid " + (c.submission_status === "PENDING" ? C.WN : C.NV),
            borderRadius:"3px", padding:"12px 14px",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
              <span style={{ fontSize:"10px", color:"#EBEBEF", fontWeight:700 }}>{c.jurisdiction} — {c.deadline_type}</span>
              <span style={{ fontSize:"9px", color: c.submission_status === "PENDING" ? C.WN : C.NV }}>{c.submission_status}</span>
            </div>
            <div style={{ fontSize:"9px", color:"#6E6E73" }}>Due: {c.due_date} — {c.responsible_party}</div>
            {c.notes && <div style={{ fontSize:"9px", color:"#6E6E73", marginTop:"4px" }}>{c.notes}</div>}
          </div>
        ))}
        {compliance.length === 0 && <div style={{ color:"#4A4A4E", fontSize:"11px" }}>No compliance items.</div>}
      </div>
    )}

    {mt === "capital" && (
      <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
        <div style={{ fontSize:"10px", color:C.EN, letterSpacing:"0.15em" }}>CAPITAL ACCOUNTS — LIVE</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:"8px" }}>
          {capital.map(c => (
            <div key={c.id} style={{ background:"#141416", border:"1px solid #252528", borderLeft:"3px solid " + C.EN, borderRadius:"3px", padding:"14px" }}>
              <div style={{ fontSize:"9px", color:C.EN, letterSpacing:"0.12em", marginBottom:"4px" }}>{c.entity} — {c.account_type}</div>
              <div style={{ fontSize:"11px", color:"#EBEBEF", fontWeight:700, marginBottom:"2px" }}>{c.account_label}</div>
              <div style={{ fontFamily:FD, fontSize:"20px", fontWeight:800, color:C.EN }}>${c.balance?.toLocaleString() ?? "0"}</div>
              <div style={{ fontSize:"9px", color:"#6E6E73", marginTop:"4px" }}>{c.institution ?? "TBD"} — {c.purpose_designation}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:"10px", color:C.EN, letterSpacing:"0.15em", marginTop:"8px" }}>TREASURY LEDGER</div>
        {treasury.map(t => (
          <div key={t.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #1C1C1F", fontSize:"10px" }}>
            <span style={{ color:"#C8C8CC" }}>{t.app} — {t.stream}</span>
            <span style={{ color: t.status === "ACTIVE" ? C.NV : t.status === "SPRINT" ? C.EN : "#6E6E73", fontSize:"9px" }}>{t.status}</span>
            <span style={{ color:C.EN }}>${t.amount?.toLocaleString() ?? "0"}</span>
          </div>
        ))}
      </div>
    )}

    {mt === "life" && LD && (
      <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
        <div style={{ fontSize:"10px", color:LD.color, letterSpacing:"0.15em" }}>{LD.label.toUpperCase()} — LIFE OS</div>
        <div style={{ display:"grid", gridTemplateColumns: LD.sections.length >= 3 ? "1fr 1fr 1fr" : "1fr 1fr", gap:"12px" }}>
          {LD.sections.map((section, i) => (
            <div key={i} style={{ background:"#141416", border:"1px solid #252528", borderRadius:"3px", padding:"14px" }}>
              <LifeSection section={{ ...section, color: LD.color }} />
            </div>
          ))}
        </div>
      </div>
    )}

    {mt === "health" && (
      <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
        <div style={{ fontSize:"10px", color:C.NV, letterSpacing:"0.15em" }}>PLATFORM HEALTH SCORES</div>
        {health.length === 0 ? (
          <div style={{ color:"#4A4A4E", fontSize:"11px" }}>No health scores yet.</div>
        ) : health.map(h => (
          <div key={h.app} style={{ background:"#141416", border:"1px solid #252528", borderLeft:"3px solid " + (h.score >= 80 ? C.NV : h.score >= 60 ? C.EN : C.WN), borderRadius:"3px", padding:"14px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:"11px", color:"#EBEBEF", fontWeight:700 }}>{h.app}</div>
              <div style={{ fontFamily:FD, fontSize:"22px", fontWeight:800, color: h.score >= 80 ? C.NV : h.score >= 60 ? C.EN : C.WN }}>{h.score}</div>
            </div>
            <div style={{ fontSize:"9px", color:"#6E6E73", marginTop:"4px" }}>{h.notes ?? "--"}</div>
          </div>
        ))}
      </div>
    )}

  </div>

  <div style={{ background:"#141416", borderTop:"1px solid #252528", padding:"8px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
    <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
      <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:C.NV }} />
      <span style={{ fontSize:"8px", color:N.nc, letterSpacing:"0.1em" }}>{N.city} — {N.region}</span>
    </div>
    <span style={{ fontSize:"7px", color:"#4A4A4E", letterSpacing:"0.1em" }}>SBI CAPITAL · AIM LLC · HANWA · CANONICAL v1.0</span>
  </div>

</div>
```

);
}
