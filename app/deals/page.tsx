'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Deal = {
id: number;
property_id: number;
seller_ask: number;
arv_estimate: number;
repair_estimate: number;
assignment_fee: number;
ula_tax_risk: boolean;
ula_impact: number;
status: string;
};

type Lead = {
id: number;
address: string;
zip: string;
units: number;
dsa_score: number;
arv_estimate: number;
assignment_fee: number;
exit_cap_rate: number;
ula_tax_risk: boolean;
status: string;
};

function fmt(n: number) {
if (!n) return '--';
if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
if (n >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K';
return '$' + n;
}

function scoreColor(s: number) {
if (s >= 85) return '#FF3C6E';
if (s >= 70) return '#FF7820';
if (s >= 55) return '#FFB800';
return '#00E5FF';
}

const DEAL_STATUSES = ['PROSPECTING', 'UNDER_LOI', 'UNDER_CONTRACT', 'CLOSED', 'DEAD'];
const statusColors: Record<string, string> = {
PROSPECTING: '#00E5FF', UNDER_LOI: '#FFB800',
UNDER_CONTRACT: '#F4A261', CLOSED: '#2ECC71', DEAD: '#484860',
};

export default function DealsPage() {
const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const [deals, setDeals] = useState<Deal[]>([]);
const [leads, setLeads] = useState<Lead[]>([]);
const [loading, setLoading] = useState(true);
const [showNewDeal, setShowNewDeal] = useState(false);
const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
const [sellerAsk, setSellerAsk] = useState('');
const [repairEstimate, setRepairEstimate] = useState('');
const [saving, setSaving] = useState(false);

useEffect(() => {
async function load() {
const [{ data: dealsData }, { data: leadsData }] = await Promise.all([
supabase.from('has_deals').select('*').order('id', { ascending: false }),
supabase.from('has_properties').select('id,address,zip,units,dsa_score,arv_estimate,assignment_fee,exit_cap_rate,ula_tax_risk,status').gte('dsa_score', 75).order('dsa_score', { ascending: false }),
]);
setDeals(dealsData || []);
setLeads(leadsData || []);
setLoading(false);
}
load();
}, []);

function calculateFee(lead: Lead, ask: number, repair: number) {
const mao = (lead.arv_estimate * 0.70) - repair;
const fee = mao - ask;
const ulaImpact = lead.ula_tax_risk ? lead.arv_estimate * 0.04 : 0;
return { mao, fee, ulaImpact, netFee: fee - ulaImpact };
}

const askNum = parseFloat(sellerAsk) || 0;
const repairNum = parseFloat(repairEstimate) || 0;
const calc = selectedLead ? calculateFee(selectedLead, askNum, repairNum) : null;

async function createDeal() {
if (!selectedLead || !sellerAsk) return;
setSaving(true);
const { data, error } = await supabase.from('has_deals').insert({
property_id: selectedLead.id,
seller_ask: askNum,
arv_estimate: selectedLead.arv_estimate,
repair_estimate: repairNum,
assignment_fee: calc?.netFee || 0,
ula_tax_risk: selectedLead.ula_tax_risk,
ula_impact: calc?.ulaImpact || 0,
status: 'PROSPECTING',
}).select().single();
if (!error && data) {
await supabase.from('has_properties').update({ status: 'NEGOTIATING' }).eq('id', selectedLead.id);
setDeals(prev => [data, ...prev]);
setShowNewDeal(false);
setSelectedLead(null);
setSellerAsk('');
setRepairEstimate('');
}
setSaving(false);
}

const funnel = {
scored: leads.length,
contacted: leads.filter(l => l.status === 'CONTACTED').length,
negotiating: leads.filter(l => l.status === 'NEGOTIATING').length,
closed: deals.filter(d => d.status === 'CLOSED').length,
totalFees: deals.filter(d => d.status === 'CLOSED').reduce((s, d) => s + (d.assignment_fee || 0), 0),
};

if (loading) return (
<div style={{ background: '#04040A', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', color: '#2ECC71', fontSize: 14, letterSpacing: '0.2em' }}>
LOADING PIPELINE B...
</div>
);

return (
<div style={{ background: '#04040A', minHeight: '100vh', color: '#F0F0FA', fontFamily: "'Courier New', monospace" }}>
<div style={{ background: '#080812', borderBottom: '1px solid #1A1A2E', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
<div>
<div style={{ fontSize: 16, fontWeight: 900 }}>HAS <span style={{ color: '#2ECC71' }}>PIPELINE B</span><span style={{ fontSize: 8, color: '#484860', marginLeft: 10 }}>WHOLESALE DEALS · SBI CAPITAL</span></div>
<div style={{ fontSize: 8, color: '#484860', marginTop: 2 }}>ASSIGNMENT CALCULATOR · CONVERSION FUNNEL · aim2030app.com</div>
</div>
<button onClick={() => setShowNewDeal(true)} style={{ background: 'rgba(46,204,113,0.15)', border: '1px solid #2ECC71', color: '#2ECC71', padding: '8px 18px', borderRadius: 3, fontSize: 9, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
+ NEW DEAL
</button>
</div>

<div style={{ background: '#080812', borderBottom: '1px solid #1A1A2E', padding: '12px 20px', display: 'flex', gap: 0, alignItems: 'center' }}>
{[['SCORED 75+', funnel.scored, '#00E5FF'], ['CONTACTED', funnel.contacted, '#FFB800'], ['NEGOTIATING', funnel.negotiating, '#F4A261'], ['CLOSED', funnel.closed, '#2ECC71'], ['TOTAL FEES', fmt(funnel.totalFees), '#2ECC71']].map(([l, v, c], i, arr) => (
<div key={l as string} style={{ display: 'flex', alignItems: 'center' }}>
<div style={{ textAlign: 'center', padding: '0 16px' }}>
<div style={{ fontSize: 7, color: '#484860', marginBottom: 3 }}>{l}</div>
<div style={{ fontSize: 18, fontWeight: 900, color: c as string }}>{v}</div>
</div>
{i < arr.length - 1 && <div style={{ fontSize: 14, color: '#1A1A2E' }}>→</div>}
</div>
))}
</div>

<div style={{ display: 'flex', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
<div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
{deals.length === 0 ? (
<div style={{ textAlign: 'center', padding: '60px', color: '#484860', fontSize: 10, letterSpacing: '0.18em' }}>
NO DEALS YET -- CLICK + NEW DEAL
</div>
) : (
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
{deals.map(deal => {
const lead = leads.find(l => l.id === deal.property_id);
const col = statusColors[deal.status] || '#484860';
return (
<div key={deal.id} style={{ background: '#080812', border: `1px solid ${col}40`, borderTop: `2px solid ${col}`, borderRadius: 4, padding: '14px' }}>
<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
<span style={{ fontSize: 7, color: col, border: `1px solid ${col}`, padding: '2px 7px', borderRadius: 2, fontWeight: 700 }}>{deal.status}</span>
<span style={{ fontSize: 8, color: '#484860' }}>#{deal.id}</span>
</div>
<div style={{ fontSize: 11, fontWeight: 700, color: '#F0F0FA', marginBottom: 4 }}>{lead?.address || `Property #${deal.property_id}`}</div>
<div style={{ fontSize: 8, color: '#484860', marginBottom: 12 }}>{lead?.zip} · {lead?.units} units</div>
{[['SELLER ASK', fmt(deal.seller_ask), '#F0F0FA'], ['ARV', fmt(deal.arv_estimate), '#2ECC71'], ['REPAIRS', fmt(deal.repair_estimate), '#FFB800'], ['FEE', fmt(deal.assignment_fee), '#2ECC71']].map(([k, v, c]) => (
<div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1A1A2E' }}>
<span style={{ fontSize: 7, color: '#484860' }}>{k}</span>
<span style={{ fontSize: 10, fontWeight: 700, color: c }}>{v}</span>
</div>
))}
<div style={{ marginTop: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
{DEAL_STATUSES.filter(s => s !== deal.status).map(s => (
<button key={s} onClick={async () => {
await supabase.from('has_deals').update({ status: s }).eq('id', deal.id);
setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, status: s } : d));
}} style={{ background: 'transparent', border: `1px solid ${statusColors[s]}`, color: statusColors[s], padding: '3px 7px', borderRadius: 2, fontSize: 6, cursor: 'pointer', fontFamily: 'inherit' }}>
→ {s}
</button>
))}
</div>
</div>
);
})}
</div>
)}
</div>

{showNewDeal && (
<div style={{ width: 320, borderLeft: '1px solid #1A1A2E', background: '#080812', overflowY: 'auto', padding: 16 }}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
<div style={{ fontSize: 9, color: '#2ECC71', fontWeight: 700 }}>NEW DEAL</div>
<button onClick={() => setShowNewDeal(false)} style={{ background: 'transparent', border: 'none', color: '#484860', cursor: 'pointer', fontSize: 14 }}>x</button>
</div>
<div style={{ marginBottom: 12 }}>
<div style={{ fontSize: 7, color: '#484860', marginBottom: 6 }}>SELECT LEAD (75+ SCORE)</div>
<div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #1A1A2E', borderRadius: 3 }}>
{leads.map(l => (
<div key={l.id} onClick={() => setSelectedLead(l)} style={{ padding: '8px 10px', cursor: 'pointer', background: selectedLead?.id === l.id ? 'rgba(46,204,113,0.1)' : 'transparent', borderBottom: '1px solid #1A1A2E', borderLeft: `2px solid ${selectedLead?.id === l.id ? '#2ECC71' : 'transparent'}` }}>
<div style={{ fontSize: 9, fontWeight: 700, color: '#C0C0D8' }}>{l.address}</div>
<div style={{ fontSize: 7, color: scoreColor(l.dsa_score) }}>DSA {l.dsa_score} · ARV {fmt(l.arv_estimate)}</div>
</div>
))}
</div>
</div>
{[['SELLER ASK', sellerAsk, setSellerAsk], ['REPAIR ESTIMATE', repairEstimate, setRepairEstimate]].map(([label, value, setter]) => (
<div key={label as string} style={{ marginBottom: 10 }}>
<div style={{ fontSize: 7, color: '#484860', marginBottom: 4 }}>{label as string}</div>
<input type="number" value={value as string} onChange={e => (setter as (v: string) => void)(e.target.value)}
style={{ width: '100%', background: '#0C0C1A', border: '1px solid #1A1A2E', color: '#F0F0FA', padding: '7px 10px', fontFamily: 'inherit', fontSize: 10, borderRadius: 2, outline: 'none', boxSizing: 'border-box' }} />
</div>
))}
{calc && selectedLead && (
<div style={{ background: '#0C0C1A', border: '1px solid #1A1A2E', borderTop: '2px solid #2ECC71', borderRadius: 3, padding: '12px', marginBottom: 12 }}>
<div style={{ fontSize: 7, color: '#2ECC71', marginBottom: 8, fontWeight: 700 }}>ASSIGNMENT CALCULATOR</div>
{[['ARV', fmt(selectedLead.arv_estimate), '#2ECC71'], ['MAO', fmt(calc.mao), '#F0F0FA'], ['Seller Ask', fmt(askNum), '#F0F0FA'], ['NET FEE', fmt(calc.netFee), calc.netFee > 0 ? '#2ECC71' : '#FF3C6E']].map(([k, v, c]) => (
<div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1A1A2E' }}>
<span style={{ fontSize: 7, color: '#484860' }}>{k}</span>
<span style={{ fontSize: 9, fontWeight: 700, color: c }}>{v}</span>
</div>
))}
</div>
)}
<button onClick={createDeal} disabled={!selectedLead || !sellerAsk || saving} style={{ width: '100%', background: 'rgba(46,204,113,0.15)', border: '1px solid #2ECC71', color: '#2ECC71', padding: '10px', borderRadius: 3, fontSize: 9, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
{saving ? 'SAVING...' : '→ CREATE DEAL'}
</button>
</div>
)}
</div>
</div>
);
}
