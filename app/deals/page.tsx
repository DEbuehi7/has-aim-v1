'use client';import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function Dashboard() {
    const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

type Deal = {
id: number;
property_id: number;
seller_ask: number;
arv_estimate: number;
noi_estimate: number;
exit_cap_rate: number;
repair_estimate: number;
assignment_fee: number;
ula_tax_risk: boolean;
ula_impact: number;
status: string;
contract_date: string;
close_date: string;
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
if (!n) return '—';
if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
return `$${n}`;
}

function scoreColor(s: number) {
if (s >= 85) return '#FF3C6E';
if (s >= 70) return '#FF7820';
if (s >= 55) return '#FFB800';
return '#00E5FF';
}

const DEAL_STATUSES = ['PROSPECTING','UNDER_LOI','UNDER_CONTRACT','CLOSED','DEAD'];

const statusColors: Record<string, string> = {
PROSPECTING: '#00E5FF',
UNDER_LOI: '#FFB800',
UNDER_CONTRACT: '#F4A261',
CLOSED: '#2ECC71',
DEAD: '#484860',
};

export default function DealsPage() {
const [deals, setDeals] = useState<Deal[]>([]);
const [leads, setLeads] = useState<Lead[]>([]);
const [loading, setLoading] = useState(true);
const [showNewDeal, setShowNewDeal] = useState(false);
const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
const [sellerAsk, setSellerAsk] = useState('');
const [repairEstimate, setRepairEstimate] = useState('');
const [noiEstimate, setNoiEstimate] = useState('');
const [saving, setSaving] = useState(false);

useEffect(() => {
async function load() {
const [{ data: dealsData }, { data: leadsData }] = await Promise.all([
supabase.from('has_deals').select('*').order('id', { ascending: false }),
supabase.from('has_properties')
.select('id, address, zip, units, dsa_score, arv_estimate, assignment_fee, exit_cap_rate, ula_tax_risk, status')
.gte('dsa_score', 75)
.order('dsa_score', { ascending: false }),
]);
setDeals(dealsData || []);
setLeads(leadsData || []);
setLoading(false);
}
load();
}, []);

// ── Assignment fee calculator ──────────────────────────────
function calculateFee(lead: Lead, sellerAskVal: number, repairVal: number) {
const arv = lead.arv_estimate || 0;
const capRate = lead.exit_cap_rate || 0.058;
const mao = (arv * 0.70) - repairVal;
const fee = mao - sellerAskVal;
const ulaImpact = lead.ula_tax_risk ? arv * 0.04 : 0;
const netFee = fee - ulaImpact;
return { mao, fee, ulaImpact, netFee };
}

const sellerAskNum = parseFloat(sellerAsk) || 0;
const repairNum = parseFloat(repairEstimate) || 0;
const noiNum = parseFloat(noiEstimate) || 0;
const calc = selectedLead ? calculateFee(selectedLead, sellerAskNum, repairNum) : null;

async function createDeal() {
if (!selectedLead || !sellerAsk) return;
setSaving(true);

const { data, error } = await supabase
.from('has_deals')
.insert({
property_id: selectedLead.id,
seller_ask: sellerAskNum,
arv_estimate: selectedLead.arv_estimate,
noi_estimate: noiNum,
exit_cap_rate: selectedLead.exit_cap_rate,
repair_estimate: repairNum,
assignment_fee: calc?.netFee || 0,
ula_tax_risk: selectedLead.ula_tax_risk,
ula_impact: calc?.ulaImpact || 0,
status: 'PROSPECTING',
})
.select()
.single();

if (!error && data) {
// Update lead status to NEGOTIATING
await supabase
.from('has_properties')
.update({ status: 'NEGOTIATING' })
.eq('id', selectedLead.id);

setDeals(prev => [data, ...prev]);
setShowNewDeal(false);
setSelectedLead(null);
setSellerAsk('');
setRepairEstimate('');
setNoiEstimate('');
}
setSaving(false);
}

// ── Funnel stats ───────────────────────────────────────────
const funnel = {
scored: leads.length,
contacted: leads.filter(l => l.status === 'CONTACTED').length,
negotiating: leads.filter(l => l.status === 'NEGOTIATING').length,
underLoi: deals.filter(d => d.status === 'UNDER_LOI').length,
closed: deals.filter(d => d.status === 'CLOSED').length,
totalFees: deals.filter(d => d.status === 'CLOSED')
.reduce((s, d) => s + (d.assignment_fee || 0), 0),
};

if (loading) return (
<div style={{ background: '#04040A', height: '100vh', display: 'flex',
alignItems: 'center', justifyContent: 'center',
fontFamily: 'monospace', color: '#2ECC71', fontSize: 14,
letterSpacing: '0.2em' }}>
LOADING PIPELINE B…
</div>
);

return (
<div style={{ background: '#04040A', minHeight: '100vh', color: '#F0F0FA',
fontFamily: "'Courier New', monospace" }}>

{/* Header */}
<div style={{ background: '#080812', borderBottom: '1px solid #1A1A2E',
padding: '14px 20px', display: 'flex', alignItems: 'center',
justifyContent: 'space-between' }}>
<div>
<div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.06em' }}>
HAS <span style={{ color: '#2ECC71' }}>PIPELINE B</span>
<span style={{ fontSize: 8, color: '#484860', marginLeft: 10,
letterSpacing: '0.2em' }}>WHOLESALE DEAL TRACKER · SBI CAPITAL</span>
</div>
<div style={{ fontSize: 8, color: '#484860', letterSpacing: '0.15em', marginTop: 2 }}>
ASSIGNMENT FEE CALCULATOR · CONVERSION FUNNEL · ULA TAX GATE
</div>
</div>
<button onClick={() => setShowNewDeal(true)} style={{
background: 'rgba(46,204,113,0.15)',
border: '1px solid #2ECC71', color: '#2ECC71',
padding: '8px 18px', borderRadius: 3, fontSize: 9,
letterSpacing: '0.14em', textTransform: 'uppercase',
cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
+ NEW DEAL
</button>
</div>

{/* Conversion funnel */}
<div style={{ background: '#080812', borderBottom: '1px solid #1A1A2E',
padding: '12px 20px', display: 'flex', gap: 0, alignItems: 'center' }}>
{[
['SCORED 75+', funnel.scored, '#00E5FF'],
['CONTACTED', funnel.contacted, '#FFB800'],
['NEGOTIATING', funnel.negotiating, '#F4A261'],
['UNDER LOI', funnel.underLoi, '#C77DFF'],
['CLOSED', funnel.closed, '#2ECC71'],
['TOTAL FEES', fmt(funnel.totalFees), '#2ECC71'],
].map(([label, value, color], i) => (
<div key={label as string} style={{ display: 'flex', alignItems: 'center' }}>
<div style={{ textAlign: 'center', padding: '0 16px' }}>
<div style={{ fontSize: 7, color: '#484860',
letterSpacing: '0.15em', marginBottom: 3 }}>{label}</div>
<div style={{ fontSize: 18, fontWeight: 900,
color: color as string }}>{value}</div>
</div>
{i < 5 && (
<div style={{ fontSize: 14, color: '#1A1A2E', margin: '0 4px' }}>→</div>
)}
</div>
))}
</div>

{/* Main content */}
<div style={{ display: 'flex', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>

{/* Deal cards */}
<div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
{deals.length === 0 ? (
<div style={{ textAlign: 'center', padding: '60px 20px',
color: '#484860', fontSize: 10, letterSpacing: '0.18em',
textTransform: 'uppercase', lineHeight: 2.5 }}>
NO DEALS YET<br/>
<span style={{ fontSize: 8, color: '#242440' }}>
CLICK + NEW DEAL TO CREATE YOUR FIRST WHOLESALE DEAL
</span>
</div>
) : (
<div style={{ display: 'grid',
gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
gap: 12 }}>
{deals.map(deal => {
const lead = leads.find(l => l.id === deal.property_id);
const col = statusColors[deal.status] || '#484860';
return (
<div key={deal.id} style={{
background: '#080812',
border: `1px solid ${col}40`,
borderTop: `2px solid ${col}`,
borderRadius: 4, padding: '14px' }}>
{/* Status badge */}
<div style={{ display: 'flex', justifyContent: 'space-between',
alignItems: 'center', marginBottom: 10 }}>
<span style={{ fontSize: 7, color: col,
border: `1px solid ${col}`, padding: '2px 7px',
borderRadius: 2, letterSpacing: '0.12em', fontWeight: 700 }}>
{deal.status}
</span>
<span style={{ fontSize: 8, color: '#484860' }}>
#{deal.id}
</span>
</div>
{/* Address */}
<div style={{ fontSize: 11, fontWeight: 700,
color: '#F0F0FA', marginBottom: 4 }}>
{lead?.address || `Property #${deal.property_id}`}
</div>
<div style={{ fontSize: 8, color: '#484860',
marginBottom: 12 }}>{lead?.zip} · {lead?.units} units</div>
{/* Financials */}
{[
['SELLER ASK', fmt(deal.seller_ask), '#F0F0FA'],
['ARV', fmt(deal.arv_estimate), '#2ECC71'],
['REPAIRS', fmt(deal.repair_estimate), '#FFB800'],
['ASSIGNMENT FEE', fmt(deal.assignment_fee), '#2ECC71'],
deal.ula_tax_risk ? ['ULA TAX IMPACT', fmt(deal.ula_impact), '#FF3C6E'] : null,
].filter((item): item is [string, string, string] => item !== null).map(([k, v, c]) => (
<div key={k as string} style={{
display: 'flex', justifyContent: 'space-between',
padding: '4px 0', borderBottom: '1px solid #1A1A2E' }}>
<span style={{ fontSize: 7, color: '#484860',
letterSpacing: '0.1em' }}>{k}</span>
<span style={{ fontSize: 10, fontWeight: 700,
color: c as string }}>{v}</span>
</div>
))}
{/* Status updater */}
<div style={{ marginTop: 10, display: 'flex', gap: 4,
flexWrap: 'wrap' }}>
{DEAL_STATUSES.filter(s => s !== deal.status).map(s => (
<button key={s} onClick={async () => {
await supabase.from('has_deals')
.update({ status: s })
.eq('id', deal.id);
setDeals(prev => prev.map(d =>
d.id === deal.id ? { ...d, status: s } : d
));
}} style={{
background: 'transparent',
border: `1px solid ${statusColors[s]}`,
color: statusColors[s], padding: '3px 7px',
borderRadius: 2, fontSize: 6,
letterSpacing: '0.1em', cursor: 'pointer',
fontFamily: 'inherit' }}>
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

{/* New deal panel */}
{showNewDeal && (
<div style={{ width: 320, borderLeft: '1px solid #1A1A2E',
background: '#080812', overflowY: 'auto', padding: 16 }}>
<div style={{ display: 'flex', justifyContent: 'space-between',
alignItems: 'center', marginBottom: 14 }}>
<div style={{ fontSize: 9, color: '#2ECC71',
letterSpacing: '0.18em', fontWeight: 700 }}>NEW DEAL</div>
<button onClick={() => setShowNewDeal(false)} style={{
background: 'transparent', border: 'none',
color: '#484860', cursor: 'pointer', fontSize: 14 }}>✕</button>
</div>

{/* Lead selector */}
<div style={{ marginBottom: 12 }}>
<div style={{ fontSize: 7, color: '#484860',
letterSpacing: '0.15em', marginBottom: 6 }}>SELECT LEAD (75+ SCORE)</div>
<div style={{ maxHeight: 200, overflowY: 'auto',
border: '1px solid #1A1A2E', borderRadius: 3 }}>
{leads.map(l => (
<div key={l.id} onClick={() => setSelectedLead(l)}
style={{
padding: '8px 10px', cursor: 'pointer',
background: selectedLead?.id === l.id
? 'rgba(46,204,113,0.1)' : 'transparent',
borderBottom: '1px solid #1A1A2E',
borderLeft: `2px solid ${selectedLead?.id === l.id
? '#2ECC71' : 'transparent'}` }}>
<div style={{ fontSize: 9, fontWeight: 700,
color: selectedLead?.id === l.id ? '#F0F0FA' : '#C0C0D8' }}>
{l.address}
</div>
<div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
<span style={{ fontSize: 7,
color: scoreColor(l.dsa_score) }}>
DSA {l.dsa_score}
</span>
<span style={{ fontSize: 7, color: '#484860' }}>
ARV {fmt(l.arv_estimate)}
</span>
</div>
</div>
))}
</div>
</div>

{/* Input fields */}
{[
['SELLER ASK', sellerAsk, setSellerAsk, 'e.g. 450000'],
['REPAIR ESTIMATE', repairEstimate, setRepairEstimate, 'e.g. 35000'],
['NOI ESTIMATE / YR', noiEstimate, setNoiEstimate, 'e.g. 48000'],
].map(([label, value, setter, placeholder]) => (
<div key={label as string} style={{ marginBottom: 10 }}>
<div style={{ fontSize: 7, color: '#484860',
letterSpacing: '0.15em', marginBottom: 4 }}>{label as string}</div>
<input
type="number"
value={value as string}
onChange={e => (setter as Function)(e.target.value)}
placeholder={placeholder as string}
style={{ width: '100%', background: '#0C0C1A',
border: '1px solid #1A1A2E', color: '#F0F0FA',
padding: '7px 10px', fontFamily: 'inherit',
fontSize: 10, borderRadius: 2, outline: 'none',
boxSizing: 'border-box' }}/>
</div>
))}

{/* Live calculator */}
{calc && selectedLead && (
<div style={{ background: '#0C0C1A',
border: '1px solid #1A1A2E',
borderTop: '2px solid #2ECC71',
borderRadius: 3, padding: '12px', marginBottom: 12 }}>
<div style={{ fontSize: 7, color: '#2ECC71',
letterSpacing: '0.18em', marginBottom: 8,
fontWeight: 700 }}>ASSIGNMENT CALCULATOR</div>
{[
['ARV', fmt(selectedLead.arv_estimate), '#2ECC71'],
['MAO (70% ARV - Repairs)',
fmt(calc.mao), '#F0F0FA'],
['Seller Ask', fmt(sellerAskNum), '#F0F0FA'],
['Gross Fee', fmt(calc.fee),
calc.fee > 0 ? '#2ECC71' : '#FF3C6E'],
selectedLead.ula_tax_risk
? ['ULA Tax (4%)', `- ${fmt(calc.ulaImpact)}`, '#FF3C6E']
: null,
['NET ASSIGNMENT FEE', fmt(calc.netFee),
calc.netFee > 0 ? '#2ECC71' : '#FF3C6E'],
].filter((item): item is [string, string, string] => item !== null).map(([k, v, c]) => (
<div key={k as string} style={{
display: 'flex', justifyContent: 'space-between',
padding: '4px 0', borderBottom: '1px solid #1A1A2E' }}>
<span style={{ fontSize: 7,
color: '#484860' }}>{k}</span>
<span style={{ fontSize: 9, fontWeight: 700,
color: c as string }}>{v}</span>
</div>
))}
{calc.netFee <= 0 && (
<div style={{ marginTop: 8, fontSize: 8,
color: '#FF3C6E', letterSpacing: '0.1em' }}>
⚠ NEGATIVE FEE — Renegotiate seller ask
</div>
)}
</div>
)}

<button onClick={createDeal}
disabled={!selectedLead || !sellerAsk || saving}
style={{
width: '100%', background: !selectedLead || !sellerAsk
? '#1A1A2E' : 'rgba(46,204,113,0.15)',
border: `1px solid ${!selectedLead || !sellerAsk
? '#1A1A2E' : '#2ECC71'}`,
color: !selectedLead || !sellerAsk ? '#484860' : '#2ECC71',
padding: '10px', borderRadius: 3, fontSize: 9,
letterSpacing: '0.14em', textTransform: 'uppercase',
cursor: !selectedLead || !sellerAsk ? 'not-allowed' : 'pointer',
fontFamily: 'inherit', fontWeight: 700 }}>
{saving ? 'SAVING…' : '→ CREATE DEAL'}
</button>
</div>
)}
</div>
</div>
);
}