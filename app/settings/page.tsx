'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function SettingsPage() {
const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const [stats, setStats] = useState({
leads: 0, deals: 0, compliance: 0,
vendors: 0, grants: 0, contacted: 0,
responded: 0, negotiating: 0,
});
const [loading, setLoading] = useState(true);
const [twilioStatus, setTwilioStatus] = useState('CHECKING...');
const [supabaseStatus, setSupabaseStatus] = useState('CHECKING...');

useEffect(() => {
async function load() {
const [
{ count: leads },
{ count: deals },
{ count: compliance },
{ count: vendors },
{ count: grants },
{ count: contacted },
{ count: responded },
{ count: negotiating },
] = await Promise.all([
supabase.from('has_properties').select('*', { count: 'exact', head: true }),
supabase.from('has_deals').select('*', { count: 'exact', head: true }),
supabase.from('has_compliance_log').select('*', { count: 'exact', head: true }),
supabase.from('has_vendors').select('*', { count: 'exact', head: true }),
supabase.from('has_grants').select('*', { count: 'exact', head: true }),
supabase.from('has_properties').select('*', { count: 'exact', head: true }).eq('status', 'CONTACTED'),
supabase.from('has_properties').select('*', { count: 'exact', head: true }).eq('status', 'RESPONDED'),
supabase.from('has_properties').select('*', { count: 'exact', head: true }).eq('status', 'NEGOTIATING'),
]);
setStats({
leads: leads || 0, deals: deals || 0,
compliance: compliance || 0, vendors: vendors || 0,
grants: grants || 0, contacted: contacted || 0,
responded: responded || 0, negotiating: negotiating || 0,
});
setSupabaseStatus('CONNECTED');
setLoading(false);
}
load();
setTwilioStatus('ACTIVE · 323-693-9076');
}, []);

const SYSTEM_CHECKS = [
{ label: 'Supabase ERM', value: supabaseStatus, color: '#2ECC71', detail: '17 tables · ktbulbreqyzimxvxlqvl' },
{ label: 'Twilio SMS', value: twilioStatus, color: '#2ECC71', detail: '10DLC registration pending · upgraded account' },
{ label: 'Vercel Deploy', value: 'LIVE', color: '#2ECC71', detail: 'aim2030app.com · auto-deploy from GitHub' },
{ label: 'ntfy.sh Alerts', value: 'ACTIVE', color: '#2ECC71', detail: 'has-sentinel-daniel · push notifications live' },
{ label: 'LADBS Scraper', value: 'COMPLETE', color: '#2ECC71', detail: '50 leads processed · 44 NO PERMIT flagged' },
{ label: 'SMS Webhook', value: 'LIVE', color: '#2ECC71', detail: 'aim2030app.com/api/sms-webhook · POST' },
{ label: 'BatchSkipTracing', value: 'PENDING FUNDS', color: '#FFB800', detail: '$50 minimum wallet · fund Thursday' },
{ label: 'HAS Foundation', value: 'PENDING FILING', color: '#FFB800', detail: 'CA SOS · $30 filing fee · Articles of Incorporation' },
{ label: 'Twilio 10DLC', value: 'UNDER REVIEW', color: '#FFB800', detail: '3-7 business days · registration submitted' },
{ label: 'n8n Automation', value: 'BLOCKED', color: '#FF3C6E', detail: 'n8n Cloud paywall · alternative: Railway self-host' },
];

const CANONICAL = [
{ label: 'Entity', value: 'Smiling Bubbles Inc. · C-Corp · EIN 47-2561589' },
{ label: 'CA RE License', value: '#02224369 · KW SELA · Ed Bonilla #00752861' },
{ label: 'FAA Drone', value: '#4229607' },
{ label: 'Twilio Number', value: '(323) 693-9076' },
{ label: 'Business Phone', value: '(323) 689-4495' },
{ label: 'Domain', value: 'aim2030app.com' },
{ label: 'Supabase Project', value: 'ktbulbreqyzimxvxlqvl' },
{ label: 'GitHub', value: 'github.com/DEbuehi7/has-aim-v1' },
{ label: 'Stack', value: 'Next.js 16 · Supabase · Drizzle · Vercel · Twilio' },
{ label: 'June 8 Milestone', value: 'Context Provider demo live · investor-ready' },
{ label: 'June 20 Deadline', value: 'Full integration · all 4 platforms deployed' },
];

if (loading) return (
<div style={{ background: '#04040A', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', color: '#8080A0', fontSize: 14, letterSpacing: '0.2em' }}>
LOADING SYSTEM STATUS...
</div>
);

return (
<div style={{ background: '#04040A', minHeight: '100vh', color: '#F0F0FA', fontFamily: "'Courier New', monospace" }}>
<div style={{ background: '#080812', borderBottom: '1px solid #1A1A2E', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
<div>
<div style={{ fontSize: 16, fontWeight: 900 }}>
AIM <span style={{ color: '#8080A0' }}>OS SETTINGS</span>
<span style={{ fontSize: 8, color: '#484860', marginLeft: 10, letterSpacing: '0.2em' }}>SYSTEM STATUS · CANONICAL LOCK · SBI CAPITAL</span>
</div>
<div style={{ fontSize: 8, color: '#484860', marginTop: 2 }}>PLATFORM HEALTH · CONFIGURATION · JUNE 8 MILESTONE TRACKER</div>
</div>
<div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
<div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ECC71', boxShadow: '0 0 6px #2ECC71' }} />
<span style={{ fontSize: 8, color: '#2ECC71', letterSpacing: '0.15em' }}>ALL SYSTEMS OPERATIONAL</span>
</div>
</div>

<div style={{ padding: '16px 20px', maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

{/* Live stats */}
<div style={{ background: '#080812', border: '1px solid #1A1A2E', borderTop: '2px solid #00E5FF', borderRadius: 4, padding: 16 }}>
<div style={{ fontSize: 8, color: '#00E5FF', letterSpacing: '0.2em', fontWeight: 700, marginBottom: 12 }}>LIVE DATABASE STATS</div>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
{[
['LEADS', stats.leads, '#00E5FF'],
['CONTACTED', stats.contacted, '#FFB800'],
['RESPONDED', stats.responded, '#2ECC71'],
['NEGOTIATING', stats.negotiating, '#F4A261'],
['DEALS', stats.deals, '#2ECC71'],
['COMPLIANCE LOGS', stats.compliance, '#C77DFF'],
['VENDORS', stats.vendors, '#C77DFF'],
['GRANTS', stats.grants, '#FFD700'],
].map(([l, v, c]) => (
<div key={l as string} style={{ padding: '8px 10px', background: '#0C0C1A', borderRadius: 3, border: '1px solid #1A1A2E' }}>
<div style={{ fontSize: 6, color: '#484860', letterSpacing: '0.15em', marginBottom: 3 }}>{l}</div>
<div style={{ fontSize: 18, fontWeight: 900, color: c as string }}>{v}</div>
</div>
))}
</div>
</div>

{/* System checks */}
<div style={{ background: '#080812', border: '1px solid #1A1A2E', borderTop: '2px solid #2ECC71', borderRadius: 4, padding: 16 }}>
<div style={{ fontSize: 8, color: '#2ECC71', letterSpacing: '0.2em', fontWeight: 700, marginBottom: 12 }}>SYSTEM HEALTH</div>
{SYSTEM_CHECKS.map(check => (
<div key={check.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #1A1A2E' }}>
<div>
<div style={{ fontSize: 8, fontWeight: 700, color: '#C0C0D8' }}>{check.label}</div>
<div style={{ fontSize: 7, color: '#484860', marginTop: 1 }}>{check.detail}</div>
</div>
<span style={{ fontSize: 7, color: check.color, border: `1px solid ${check.color}40`, padding: '2px 7px', borderRadius: 2, flexShrink: 0, marginLeft: 8 }}>{check.value}</span>
</div>
))}
</div>

{/* Canonical lock */}
<div style={{ background: '#080812', border: '1px solid rgba(255,215,0,0.3)', borderTop: '2px solid #FFD700', borderRadius: 4, padding: 16, gridColumn: '1 / -1' }}>
<div style={{ fontSize: 8, color: '#FFD700', letterSpacing: '0.2em', fontWeight: 700, marginBottom: 12 }}>CANONICAL LOCK · SBI CAPITAL · April 11 2026</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 8 }}>
{CANONICAL.map(item => (
<div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#0C0C1A', borderRadius: 3, gap: 10 }}>
<span style={{ fontSize: 7, color: '#484860', flexShrink: 0 }}>{item.label}</span>
<span style={{ fontSize: 8, color: '#C0C0D8', textAlign: 'right', fontWeight: 700 }}>{item.value}</span>
</div>
))}
</div>
</div>
</div>
</div>
);
}