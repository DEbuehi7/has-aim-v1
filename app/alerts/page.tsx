'use client';export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Alert = {
id: number;
content_id: string;
content_type: string;
notes: string;
review_date: string;
approved: boolean;
human_reviewed: boolean;
};

export default function AlertsPage() {
const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const [alerts, setAlerts] = useState<Alert[]>([]);
const [loading, setLoading] = useState(true);
const [filter, setFilter] = useState('ALL');

useEffect(() => {
async function load() {
const { data } = await supabase
.from('has_compliance_log')
.select('*')
.order('review_date', { ascending: false })
.limit(100);
setAlerts(data || []);
setLoading(false);
}
load();

// Auto-refresh every 30 seconds
const interval = setInterval(load, 30000);
return () => clearInterval(interval);
}, []);

const types = ['ALL', 'sms_response', 'outreach_sms', 'pipeline_b', 'outreach_sms'];
const uniqueTypes = ['ALL', ...Array.from(new Set(alerts.map(a => a.content_type)))];

const filtered = alerts.filter(a => filter === 'ALL' || a.content_type === filter);

const stats = {
total: alerts.length,
responses: alerts.filter(a => a.content_type === 'sms_response').length,
outreach: alerts.filter(a => a.content_type === 'outreach_sms').length,
pipeline: alerts.filter(a => a.content_type === 'pipeline_b').length,
};

function typeColor(t: string) {
if (t === 'sms_response') return '#FF3C6E';
if (t === 'outreach_sms') return '#00E5FF';
if (t === 'pipeline_b') return '#2ECC71';
return '#FFB800';
}

function formatTime(dateStr: string) {
const d = new Date(dateStr);
return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

if (loading) return (
<div style={{ background: '#04040A', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', color: '#FF3C6E', fontSize: 14, letterSpacing: '0.2em' }}>
LOADING ALERT FEED...
</div>
);

return (
<div style={{ background: '#04040A', minHeight: '100vh', color: '#F0F0FA', fontFamily: "'Courier New', monospace" }}>

{/* Header */}
<div style={{ background: '#080812', borderBottom: '1px solid #1A1A2E', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
<div>
<div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.06em' }}>
HAS <span style={{ color: '#FF3C6E' }}>ALERTS</span>
<span style={{ fontSize: 8, color: '#484860', marginLeft: 10, letterSpacing: '0.2em' }}>COMPLIANCE LOG · INBOUND FEED · LIVE</span>
</div>
<div style={{ fontSize: 8, color: '#484860', letterSpacing: '0.15em', marginTop: 2 }}>
AUTO-REFRESH 30s · SBI CAPITAL · aim2030app.com
</div>
</div>
<div style={{ display: 'flex', gap: 20 }}>
{[
['TOTAL', stats.total, '#C0C0D8'],
['RESPONSES', stats.responses, '#FF3C6E'],
['OUTREACH', stats.outreach, '#00E5FF'],
['PIPELINE', stats.pipeline, '#2ECC71'],
].map(([l, v, c]) => (
<div key={l as string} style={{ textAlign: 'center' }}>
<div style={{ fontSize: 7, color: '#484860', letterSpacing: '0.15em' }}>{l}</div>
<div style={{ fontSize: 14, fontWeight: 900, color: c as string }}>{v}</div>
</div>
))}
</div>
</div>

{/* Filter tabs */}
<div style={{ background: '#080812', borderBottom: '1px solid #1A1A2E', padding: '0 20px', display: 'flex' }}>
{uniqueTypes.map(t => (
<button key={t} onClick={() => setFilter(t)} style={{
background: 'transparent', border: 'none',
borderBottom: `2px solid ${filter === t ? typeColor(t) : 'transparent'}`,
color: filter === t ? typeColor(t) : '#484860',
padding: '8px 14px', fontFamily: 'inherit', fontSize: 8,
letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase'
}}>{t === 'ALL' ? 'ALL' : t.replace('_', ' ')}</button>
))}
<div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', padding: '0 14px' }}>
<div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF3C6E', boxShadow: '0 0 6px #FF3C6E', animation: 'pulse 1.5s infinite' }} />
<span style={{ fontSize: 7, color: '#FF3C6E', marginLeft: 6, letterSpacing: '0.15em' }}>LIVE</span>
</div>
</div>

{/* Alert feed */}
<div style={{ padding: '16px', maxWidth: 900, margin: '0 auto' }}>
{filtered.length === 0 ? (
<div style={{ textAlign: 'center', padding: '60px', color: '#484860', fontSize: 10, letterSpacing: '0.18em' }}>
NO ALERTS YET
</div>
) : (
filtered.map(alert => (
<div key={alert.id} style={{
background: '#080812',
border: `1px solid ${typeColor(alert.content_type)}30`,
borderLeft: `3px solid ${typeColor(alert.content_type)}`,
borderRadius: 3, padding: '12px 14px', marginBottom: 8
}}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
<span style={{
fontSize: 7, color: typeColor(alert.content_type),
border: `1px solid ${typeColor(alert.content_type)}`,
padding: '1px 6px', borderRadius: 2, letterSpacing: '0.1em', fontWeight: 700
}}>{alert.content_type.replace('_', ' ').toUpperCase()}</span>
<span style={{ fontSize: 8, color: '#484860' }}>ID: {alert.content_id}</span>
{alert.content_type === 'sms_response' && (
<span style={{ fontSize: 7, color: '#FF3C6E', background: 'rgba(255,60,110,0.1)', padding: '1px 6px', borderRadius: 2 }}>
INBOUND
</span>
)}
</div>
<span style={{ fontSize: 8, color: '#484860' }}>{formatTime(alert.review_date)}</span>
</div>
<div style={{ fontSize: 10, color: '#C0C0D8', lineHeight: 1.6 }}>{alert.notes}</div>
<div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
<span style={{ fontSize: 7, color: alert.human_reviewed ? '#2ECC71' : '#484860' }}>
{alert.human_reviewed ? '✓ REVIEWED' : '○ PENDING'}
</span>
<span style={{ fontSize: 7, color: alert.approved ? '#2ECC71' : '#484860' }}>
{alert.approved ? '✓ APPROVED' : '○ UNAPPROVED'}
</span>
</div>
</div>
))
)}
</div>

<style>{`
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.5)} }
`}</style>
</div>
);
}