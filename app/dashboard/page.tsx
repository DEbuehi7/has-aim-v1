'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function Dashboard() {
    const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    export const dynamic = 'force-dynamic';
type Lead = {id: number;
    address: string;
    zip: string;
    units: number;
    zoning: string;
    dsa_score: number;
    status: string;
    tax_delinquent: boolean;
    rent_control: boolean;
    ula_tax_risk: boolean;
    active_violation: boolean;
    deferred_maint: boolean;
    arv_estimate: number;
    assignment_fee: number;
    years_owned: number;
    days_since_permit: number | null;
    exit_cap_rate: number | null;
    };

function scoreColor(s: number) {
if (s >= 85) return '#FF3C6E';
if (s >= 70) return '#FF7820';
if (s >= 55) return '#FFB800';
if (s >= 40) return '#00E5FF';
return '#484860';
}

function scoreLabel(s: number) {
if (s >= 85) return 'CRITICAL';
if (s >= 70) return 'HIGH';
if (s >= 55) return 'MED';
if (s >= 40) return 'LOW';
return 'COLD';
}

function fmt(n: number) {
if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
return `$${n}`;
}

export default function Dashboard() {
const [leads, setLeads] = useState<Lead[]>([]);
const [loading, setLoading] = useState(true);
const [sortBy, setSortBy] = useState<'dsa_score' | 'arv_estimate' | 'assignment_fee'>('dsa_score');
const [filterZip, setFilterZip] = useState('ALL');
const [filterStatus, setFilterStatus] = useState('ALL');
const [selected, setSelected] = useState<Lead | null>(null);

useEffect(() => {
async function load() {
const { data, error } = await supabase
.from('has_properties')
.select('*')
.order('dsa_score', { ascending: false });
if (error) console.error(error);
else setLeads(data || []);
setLoading(false);
}
load();
}, []);

async function updateLeadStatus(id: number, status: string) {const { error } = await supabase
.from('has_properties')
.update({ status })
.eq('id', id);
if (error) console.error('Status update error:', error);
return !error;
}

async function logCompliance(contentId: string, contentType: string, notes: string) {
const { error } = await supabase
.from('has_compliance_log')
.insert({
content_id: contentId,
content_type: contentType,
human_reviewed: true,
review_date: new Date().toISOString(),
approved: true,
reviewer: 'Daniel Ebuehi',
notes,
});
if (error) console.error('Compliance log error:', error);
return !error;
}

const zips = ['ALL', ...Array.from(new Set(leads.map(l => l.zip))).sort()];
const statuses = ['ALL', 'NEW', 'CONTACTED', 'RESPONDED', 'NEGOTIATING', 'CLOSED'];

const filtered = leads
.filter(l => filterZip === 'ALL' || l.zip === filterZip)
.filter(l => filterStatus === 'ALL' || l.status === filterStatus)
.sort((a, b) => (b[sortBy] as number) - (a[sortBy] as number));

const stats = {
total: filtered.length,
critical: filtered.filter(l => l.dsa_score >= 85).length,
high: filtered.filter(l => l.dsa_score >= 70 && l.dsa_score < 85).length,
delinq: filtered.filter(l => l.tax_delinquent).length,
rentControl: filtered.filter(l => l.rent_control).length,
totalFees: filtered.reduce((s, l) => s + (l.assignment_fee || 0), 0),
};

if (loading) return (
<div style={{ background: '#04040A', height: '100vh', display: 'flex',
alignItems: 'center', justifyContent: 'center',
fontFamily: 'monospace', color: '#00E5FF', fontSize: 14, letterSpacing: '0.2em' }}>
LOADING DSA v2 INTELLIGENCE…
</div>
);

return (
<div style={{ background: '#04040A', minHeight: '100vh', color: '#F0F0FA',
fontFamily: "'Courier New', monospace", fontSize: 12 }}>

{/* Header */}
<div style={{ background: '#080812', borderBottom: '1px solid #1A1A2E',
padding: '14px 20px', display: 'flex', alignItems: 'center',
justifyContent: 'space-between' }}>
<div>
<div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.06em' }}>
HAS <span style={{ color: '#00E5FF' }}>SENTINEL</span>
<span style={{ fontSize: 8, color: '#484860', marginLeft: 10,
letterSpacing: '0.2em' }}>DSA v2 · CONTEXT PROVIDER · SELA</span>
</div>
<div style={{ fontSize: 8, color: '#484860', letterSpacing: '0.15em', marginTop: 2 }}>
REAL ESTATE REALITY OS · SBI CAPITAL · aim2030app.com
</div>
</div>
{/* Stat bar */}
<div style={{ display: 'flex', gap: 20 }}>
{[
['LEADS', stats.total, '#00E5FF'],
['CRITICAL', stats.critical, '#FF3C6E'],
['HIGH', stats.high, '#FF7820'],
['DELINQ', stats.delinq, '#FF3C6E'],
['RENT CTRL', stats.rentControl, '#FFB800'],
['TOTAL FEES', fmt(stats.totalFees), '#2ECC71'],
].map(([l, v, c]) => (
<div key={l as string} style={{ textAlign: 'center' }}>
<div style={{ fontSize: 7, color: '#484860', letterSpacing: '0.15em' }}>{l}</div>
<div style={{ fontSize: 14, fontWeight: 900, color: c as string }}>{v}</div>
</div>
))}
</div>
</div>

{/* Filter bar */}
<div style={{ background: '#080812', borderBottom: '1px solid #1A1A2E',
padding: '0 20px', display: 'flex', alignItems: 'center', gap: 0,
overflowX: 'auto' }}>
{/* ZIP filter */}
<div style={{ display: 'flex', borderRight: '1px solid #1A1A2E' }}>
{zips.map(z => (
<button key={z} onClick={() => setFilterZip(z)} style={{
background: 'transparent', border: 'none',
borderBottom: `2px solid ${filterZip === z ? '#00E5FF' : 'transparent'}`,
color: filterZip === z ? '#00E5FF' : '#484860',
padding: '8px 12px', fontFamily: 'inherit',
fontSize: 8, letterSpacing: '0.12em', cursor: 'pointer' }}>
{z}
</button>
))}
</div>
{/* Status filter */}
<div style={{ display: 'flex', borderRight: '1px solid #1A1A2E' }}>
{statuses.map(s => {
const colors: Record<string, string> = {
ALL: '#00E5FF', NEW: '#FF3C6E', CONTACTED: '#FFB800',
RESPONDED: '#2ECC71', NEGOTIATING: '#F4A261', CLOSED: '#8080A0'
};
return (
<button key={s} onClick={() => setFilterStatus(s)} style={{
background: 'transparent', border: 'none',
borderBottom: `2px solid ${filterStatus === s ? colors[s] : 'transparent'}`,
color: filterStatus === s ? colors[s] : '#484860',
padding: '8px 10px', fontFamily: 'inherit',
fontSize: 8, letterSpacing: '0.1em', cursor: 'pointer' }}>
{s}
</button>
);
})}
</div>
{/* Sort */}
<div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center',
gap: 8, padding: '0 14px', flexShrink: 0 }}>
<span style={{ fontSize: 7, color: '#484860' }}>SORT</span>
{(['dsa_score', 'arv_estimate', 'assignment_fee'] as const).map(s => (
<button key={s} onClick={() => setSortBy(s)} style={{
background: sortBy === s ? 'rgba(0,229,255,0.1)' : 'transparent',
border: `1px solid ${sortBy === s ? '#00E5FF' : '#1A1A2E'}`,
color: sortBy === s ? '#00E5FF' : '#484860',
padding: '3px 8px', borderRadius: 2, fontSize: 7,
letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit' }}>
{s === 'dsa_score' ? 'SCORE' : s === 'arv_estimate' ? 'ARV' : 'FEE'}
</button>
))}
</div>
</div>

{/* Main content */}
<div style={{ display: 'flex', height: 'calc(100vh - 110px)', overflow: 'hidden' }}>

{/* Leads table */}
<div style={{ flex: 1, overflowY: 'auto' }}>
<table style={{ width: '100%', borderCollapse: 'collapse' }}>
<thead>
<tr style={{ background: '#0C0C1A', borderBottom: '2px solid #1A1A2E',
position: 'sticky', top: 0, zIndex: 2 }}>
{['ADDRESS', 'ZIP', 'SCORE', 'UNITS', 'ZONING', 'ARV', 'FEE', 'FLAGS', 'STATUS'].map(h => (
<th key={h} style={{ padding: '8px 12px', fontSize: 7,
letterSpacing: '0.15em', color: '#484860', textAlign: 'left',
fontWeight: 700 }}>{h}</th>
))}
</tr>
</thead>
<tbody>
{filtered.map(lead => {
const isSel = selected?.id === lead.id;
const col = scoreColor(lead.dsa_score);
return (
<tr key={lead.id} onClick={() => setSelected(isSel ? null : lead)}
style={{
background: isSel ? `rgba(0,229,255,0.06)` : 'transparent',
borderBottom: '1px solid #1A1A2E', cursor: 'pointer',
transition: 'background 0.1s'
}}
onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = '#101020'; }}
onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
<td style={{ padding: '10px 12px', fontSize: 11,
color: isSel ? '#F0F0FA' : '#C0C0D8' }}>{lead.address}</td>
<td style={{ padding: '10px 12px', fontSize: 10, color: '#484860' }}>{lead.zip}</td>
<td style={{ padding: '10px 12px' }}>
<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
<div style={{ width: 40, height: 3, background: '#1A1A2E',
borderRadius: 2, overflow: 'hidden' }}>
<div style={{ width: `${lead.dsa_score}%`, height: '100%',
background: col, borderRadius: 2,
boxShadow: `0 0 4px ${col}` }}/>
</div>
<span style={{ fontSize: 11, fontWeight: 700, color: col }}>
{lead.dsa_score}
</span>
<span style={{ fontSize: 7, color: col, border: `1px solid ${col}`,
padding: '1px 4px', borderRadius: 1, opacity: 0.8 }}>
{scoreLabel(lead.dsa_score)}
</span>
</div>
</td>
<td style={{ padding: '10px 12px', fontSize: 11,
color: '#C0C0D8', textAlign: 'center' }}>{lead.units}</td>
<td style={{ padding: '10px 12px', fontSize: 9,
color: '#8080A0' }}>{lead.zoning}</td>
<td style={{ padding: '10px 12px', fontSize: 11,
color: '#2ECC71', fontWeight: 700 }}>{fmt(lead.arv_estimate)}</td>
<td style={{ padding: '10px 12px', fontSize: 11,
color: '#F4A261', fontWeight: 700 }}>{fmt(lead.assignment_fee)}</td>
<td style={{ padding: '10px 12px' }}>
<div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
{lead.tax_delinquent && <span style={{ fontSize: 6, color: '#FF3C6E',border: '1px solid #FF3C6E', padding: '1px 4px',
borderRadius: 1 }}>TAX</span>}
{lead.rent_control && <span style={{ fontSize: 6, color: '#FFB800',
border: '1px solid #FFB800', padding: '1px 4px',
borderRadius: 1 }}>RSO</span>}
{lead.active_violation && <span style={{ fontSize: 6, color: '#FF3C6E',
border: '1px solid #FF3C6E', padding: '1px 4px',
borderRadius: 1 }}>VIOL</span>}
{lead.deferred_maint && <span style={{ fontSize: 6, color: '#C77DFF',
border: '1px solid #C77DFF', padding: '1px 4px',
borderRadius: 1 }}>NO PERMIT</span>}
{(lead.days_since_permit ?? 0) > 1825 && (
<span style={{ fontSize: 6, color: '#FF7820',
border: '1px solid #FF7820', padding: '1px 4px',
borderRadius: 1 }}>5YR+</span>
)}
</div>
</td>
<td style={{ padding: '10px 12px' }}>
<span style={{ fontSize: 8, letterSpacing: '0.08em',
color: lead.status === 'CONTACTED' ? '#FFB800' :
lead.status === 'NEGOTIATING' ? '#F4A261' : '#484860' }}>
{lead.status}
</span>
</td>
</tr>
);
})}
</tbody>
</table>
</div>

{/* Detail panel */}
{selected && (
<div style={{ width: 260, borderLeft: '1px solid #1A1A2E',
background: '#080812', overflowY: 'auto', padding: 16 }}>
<div style={{ display: 'flex', justifyContent: 'space-between',
alignItems: 'center', marginBottom: 12 }}>
<div style={{ fontSize: 8, color: '#484860', letterSpacing: '0.18em' }}>LEAD DETAIL</div>
<button onClick={() => setSelected(null)} style={{ background: 'transparent',
border: 'none', color: '#484860', cursor: 'pointer', fontSize: 14 }}>✕</button>
</div>
{/* Score badge */}
<div style={{ textAlign: 'center', padding: '12px',
background: `${scoreColor(selected.dsa_score)}15`,
border: `1px solid ${scoreColor(selected.dsa_score)}40`,
borderTop: `2px solid ${scoreColor(selected.dsa_score)}`,
borderRadius: 4, marginBottom: 12 }}>
<div style={{ fontSize: 32, fontWeight: 900,
color: scoreColor(selected.dsa_score) }}>{selected.dsa_score}</div>
<div style={{ fontSize: 8, color: scoreColor(selected.dsa_score),
letterSpacing: '0.18em', fontWeight: 700 }}>
{scoreLabel(selected.dsa_score)} DISTRESS
</div>
</div>
{/* Fields */}
{[
['ADDRESS', selected.address],
['ZIP', selected.zip],
['ZONING', selected.zoning],
['TYPE', selected.units > 1 ? `MULTI · ${selected.units}u` : 'SFR'],
['YEARS OWNED', `${selected.years_owned} YRS`],
['ARV', fmt(selected.arv_estimate)],
['ASSIGNMENT FEE', fmt(selected.assignment_fee)],
['TAX DELINQUENT', selected.tax_delinquent ? 'YES ⚠' : 'CLEAR'],
['RENT CONTROL', selected.rent_control ? 'RSO ⚠' : 'CLEAR'],
['ACTIVE VIOLATION', selected.active_violation ? 'YES ⚠' : 'CLEAR'],
['DEFERRED MAINT', selected.deferred_maint ? 'YES — NO PERMIT ON RECORD' : 'NO'],['DAYS SINCE PERMIT', (selected.days_since_permit ?? 0) === 9999 ? 'NO RECORD' :
    selected.days_since_permit ? `${selected.days_since_permit} DAYS` : '—'],
    ['LADBS STATUS', (selected.days_since_permit ?? 0) === 9999 ? '⚠ UNVERIFIED' :
    (selected.days_since_permit ?? 0) > 1825 ? '⚠ DEFERRED' : '✓ ACTIVE'],
['STATUS', selected.status],
].map(([k, v]) => (
<div key={k} style={{ display: 'flex', justifyContent: 'space-between',
padding: '5px 0', borderBottom: '1px solid #1A1A2E' }}>
<span style={{ fontSize: 7, color: '#484860',
letterSpacing: '0.1em' }}>{k}</span>
<span style={{ fontSize: 9, fontWeight: 700,
color: (k === 'TAX DELINQUENT' && selected.tax_delinquent) ||
(k === 'RENT CONTROL' && selected.rent_control) ||
(k === 'ACTIVE VIOLATION' && selected.active_violation)
? '#FF3C6E' : '#C0C0D8' }}>{v}</span>
</div>
))}
{/* Action buttons */}
<div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
<button onClick={async () => {
const ok = await updateLeadStatus(selected.id, 'CONTACTED');
if (ok) {
await logCompliance(
String(selected.id),
'outreach_sms',
`Lead ${selected.address} moved to CONTACTED — DSA score ${selected.dsa_score}`
);
setLeads(prev => prev.map(l =>
l.id === selected.id ? { ...l, status: 'CONTACTED' } : l
));
setSelected({ ...selected, status: 'CONTACTED' });
}
}}
style={{ background: `${scoreColor(selected.dsa_score)}20`,
border: `1px solid ${scoreColor(selected.dsa_score)}`,
color: scoreColor(selected.dsa_score), padding: '8px',
borderRadius: 3, fontSize: 8, letterSpacing: '0.14em',
textTransform: 'uppercase', cursor: 'pointer',
fontFamily: 'inherit', fontWeight: 700 }}>
→ MARK CONTACTED
</button>
<button
onClick={async () => {
const ok = await updateLeadStatus(selected.id, 'NEGOTIATING');
if (ok) {
await logCompliance(
String(selected.id),
'pipeline_b',
`Lead ${selected.address} added to Pipeline B — DSA score ${selected.dsa_score}`
);
setLeads(prev => prev.map(l =>
l.id === selected.id ? { ...l, status: 'NEGOTIATING' } : l
));
setSelected({ ...selected, status: 'NEGOTIATING' });
}
}}
style={{ background: 'transparent',
border: '1px solid #1A1A2E', color: '#484860',
padding: '8px', borderRadius: 3, fontSize: 8,
letterSpacing: '0.14em', textTransform: 'uppercase',
cursor: 'pointer', fontFamily: 'inherit' }}>
→ ADD TO PIPELINE B
</button>
</div>
</div>
)}
</div>
</div>
);
}