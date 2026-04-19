'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Grant = {
id: number;
grant_name: string;
agency: string;
amount_min: number;
amount_max: number;
deadline: string;
status: string;
application_url: string;
notes: string;
};

function fmt(n: number) {
if (!n) return '--';
if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
if (n >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K';
return '$' + n;
}

function statusColor(s: string) {
if (s === 'SUBMITTED') return '#2ECC71';
if (s === 'APPROVED') return '#FFD700';
if (s === 'PENDING') return '#FFB800';
if (s === 'IDENTIFIED') return '#00E5FF';
if (s === 'REJECTED') return '#FF3C6E';
return '#484860';
}

function daysUntil(dateStr: string) {
const diff = new Date(dateStr).getTime() - Date.now();
return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const STATUSES = ['IDENTIFIED', 'PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'];

export default function GrantsPage() {
const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const [grants, setGrants] = useState<Grant[]>([]);
const [loading, setLoading] = useState(true);
const [filter, setFilter] = useState('ALL');

useEffect(() => {
supabase.from('has_grants').select('*').order('deadline', { ascending: true })
.then(({ data }) => { setGrants(data || []); setLoading(false); });
}, []);

async function updateStatus(id: number, status: string) {
await supabase.from('has_grants').update({ status }).eq('id', id);
setGrants(prev => prev.map(g => g.id === id ? { ...g, status } : g));
}

const filtered = grants.filter(g => filter === 'ALL' || g.status === filter);

const stats = {
total: grants.length,
totalMin: grants.reduce((s, g) => s + (g.amount_min || 0), 0),
totalMax: grants.reduce((s, g) => s + (g.amount_max || 0), 0),
submitted: grants.filter(g => g.status === 'SUBMITTED').length,
approved: grants.filter(g => g.status === 'APPROVED').length,
};

if (loading) return (
<div style={{ background: '#04040A', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', color: '#FFD700', fontSize: 14, letterSpacing: '0.2em' }}>
LOADING GRANT PIPELINE...
</div>
);

return (
<div style={{ background: '#04040A', minHeight: '100vh', color: '#F0F0FA', fontFamily: "'Courier New', monospace" }}>

{/* Header */}
<div style={{ background: '#080812', borderBottom: '1px solid #1A1A2E', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
<div>
<div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.06em' }}>
HAS <span style={{ color: '#FFD700' }}>GRANT WORKFLOW</span>
<span style={{ fontSize: 8, color: '#484860', marginLeft: 10, letterSpacing: '0.2em' }}>HUD · HCD · ACADEMIC · SBI CAPITAL</span>
</div>
<div style={{ fontSize: 8, color: '#484860', letterSpacing: '0.15em', marginTop: 2 }}>
FEDERAL + STATE + INSTITUTIONAL FUNDING PIPELINE · aim2030app.com
</div>
</div>
<div style={{ display: 'flex', gap: 20 }}>
{[
['GRANTS', stats.total, '#FFD700'],
['POTENTIAL MIN', fmt(stats.totalMin), '#2ECC71'],
['POTENTIAL MAX', fmt(stats.totalMax), '#2ECC71'],
['SUBMITTED', stats.submitted, '#00E5FF'],
['APPROVED', stats.approved, '#FFD700'],
].map(([l, v, c]) => (
<div key={l as string} style={{ textAlign: 'center' }}>
<div style={{ fontSize: 7, color: '#484860', letterSpacing: '0.15em' }}>{l}</div>
<div style={{ fontSize: 14, fontWeight: 900, color: c as string }}>{v}</div>
</div>
))}
</div>
</div>

{/* Filter */}
<div style={{ background: '#080812', borderBottom: '1px solid #1A1A2E', padding: '0 20px', display: 'flex' }}>
{['ALL', ...STATUSES].map(s => (
<button key={s} onClick={() => setFilter(s)} style={{
background: 'transparent', border: 'none',
borderBottom: `2px solid ${filter === s ? statusColor(s) : 'transparent'}`,
color: filter === s ? statusColor(s) : '#484860',
padding: '8px 14px', fontFamily: 'inherit', fontSize: 8,
letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase'
}}>{s}</button>
))}
</div>

{/* Grant cards */}
<div style={{ padding: '16px', maxWidth: 1000, margin: '0 auto' }}>
{filtered.map(grant => {
const days = daysUntil(grant.deadline);
const col = statusColor(grant.status);
const urgent = days < 30 && days > 0;
return (
<div key={grant.id} style={{
background: '#080812',
border: `1px solid ${col}30`,
borderLeft: `3px solid ${col}`,
borderRadius: 4, padding: '14px 16px', marginBottom: 10
}}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
<div style={{ flex: 1 }}>
<div style={{ fontSize: 12, fontWeight: 700, color: '#F0F0FA', marginBottom: 3 }}>{grant.grant_name}</div>
<div style={{ fontSize: 9, color: '#8080A0' }}>{grant.agency}</div>
</div>
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
<span style={{ fontSize: 7, color: col, border: `1px solid ${col}`, padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
{grant.status}
</span>
<span style={{ fontSize: 9, color: urgent ? '#FF3C6E' : '#484860', fontWeight: urgent ? 700 : 400 }}>
{days > 0 ? `${days} days left` : 'DEADLINE PASSED'}
</span>
</div>
</div>

{/* Financials */}
<div style={{ display: 'flex', gap: 20, marginBottom: 8 }}>
<div>
<div style={{ fontSize: 7, color: '#484860' }}>RANGE</div>
<div style={{ fontSize: 11, fontWeight: 700, color: '#2ECC71' }}>
{fmt(grant.amount_min)} - {fmt(grant.amount_max)}
</div>
</div>
<div>
<div style={{ fontSize: 7, color: '#484860' }}>DEADLINE</div>
<div style={{ fontSize: 11, color: urgent ? '#FF3C6E' : '#C0C0D8', fontWeight: urgent ? 700 : 400 }}>
{new Date(grant.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
</div>
</div>
</div>

{/* Notes */}
<div style={{ fontSize: 9, color: '#8080A0', lineHeight: 1.6, marginBottom: 10 }}>{grant.notes}</div>

{/* Actions */}
<div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
{STATUSES.filter(s => s !== grant.status).map(s => (
<button key={s} onClick={() => updateStatus(grant.id, s)} style={{
background: 'transparent', border: `1px solid ${statusColor(s)}`,
color: statusColor(s), padding: '3px 8px', borderRadius: 2,
fontSize: 6, letterSpacing: '0.1em', cursor: 'pointer', fontFamily: 'inherit'
}}>→ {s}</button>
))}
{grant.application_url && (
<a href={grant.application_url} target="_blank" rel="noopener noreferrer" style={{
background: 'rgba(255,215,0,0.1)', border: '1px solid #FFD700',
color: '#FFD700', padding: '3px 8px', borderRadius: 2,
fontSize: 6, letterSpacing: '0.1em', cursor: 'pointer',
fontFamily: 'inherit', textDecoration: 'none'
}}>APPLY →</a>
)}
</div>
</div>
);
})}
</div>
</div>
);
}