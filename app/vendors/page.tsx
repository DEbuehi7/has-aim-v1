'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Vendor = {
id: number;
company_name: string;
category: string;
contact_name: string;
phone: string;
email: string;
rate_type: string;
rate_amount: number;
revenue_share: number;
status: string;
rating: number;
notes: string;
};

function statusColor(s: string) {
if (s === 'ACTIVE') return '#2ECC71';
if (s === 'PENDING') return '#FFB800';
if (s === 'IDENTIFIED') return '#00E5FF';
if (s === 'INACTIVE') return '#484860';
return '#484860';
}

function categoryColor(c: string) {
if (c === 'Property Management') return '#C77DFF';
if (c === 'Real Estate Brokerage') return '#FF3C6E';
if (c === 'SMS Platform') return '#00E5FF';
if (c === 'Database') return '#2ECC71';
if (c === 'Skip Tracing') return '#FFB800';
return '#F4A261';
}

const STATUSES = ['ACTIVE', 'PENDING', 'IDENTIFIED', 'INACTIVE'];

export default function VendorsPage() {
const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const [vendors, setVendors] = useState<Vendor[]>([]);
const [loading, setLoading] = useState(true);
const [filter, setFilter] = useState('ALL');
const [selected, setSelected] = useState<Vendor | null>(null);

useEffect(() => {
supabase.from('has_vendors').select('*').order('status', { ascending: true })
.then(({ data }) => { setVendors(data || []); setLoading(false); });
}, []);

async function updateStatus(id: number, status: string) {
await supabase.from('has_vendors').update({ status }).eq('id', id);
setVendors(prev => prev.map(v => v.id === id ? { ...v, status } : v));
if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
}

const categories = ['ALL', ...Array.from(new Set(vendors.map(v => v.category)))];
const filtered = vendors.filter(v => filter === 'ALL' || v.category === filter);

const stats = {
total: vendors.length,
active: vendors.filter(v => v.status === 'ACTIVE').length,
pending: vendors.filter(v => v.status === 'PENDING').length,
monthlySpend: vendors.filter(v => v.rate_type === 'monthly').reduce((s, v) => s + (v.rate_amount || 0), 0),
};

if (loading) return (
<div style={{ background: '#04040A', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', color: '#C77DFF', fontSize: 14, letterSpacing: '0.2em' }}>
LOADING VENDOR NETWORK...
</div>
);

return (
<div style={{ background: '#04040A', minHeight: '100vh', color: '#F0F0FA', fontFamily: "'Courier New', monospace" }}>

<div style={{ background: '#080812', borderBottom: '1px solid #1A1A2E', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
<div>
<div style={{ fontSize: 16, fontWeight: 900 }}>
HAS <span style={{ color: '#C77DFF' }}>VENDOR NETWORK</span>
<span style={{ fontSize: 8, color: '#484860', marginLeft: 10, letterSpacing: '0.2em' }}>B2B CONTRACTOR SYSTEM · SBI CAPITAL</span>
</div>
<div style={{ fontSize: 8, color: '#484860', marginTop: 2 }}>PREFERRED VENDORS · REVENUE SHARE · PERFORMANCE TRACKING</div>
</div>
<div style={{ display: 'flex', gap: 20 }}>
{[
['VENDORS', stats.total, '#C77DFF'],
['ACTIVE', stats.active, '#2ECC71'],
['PENDING', stats.pending, '#FFB800'],
['MONTHLY SPEND', '$' + stats.monthlySpend, '#FF3C6E'],
].map(([l, v, c]) => (
<div key={l as string} style={{ textAlign: 'center' }}>
<div style={{ fontSize: 7, color: '#484860', letterSpacing: '0.15em' }}>{l}</div>
<div style={{ fontSize: 14, fontWeight: 900, color: c as string }}>{v}</div>
</div>
))}
</div>
</div>

<div style={{ background: '#080812', borderBottom: '1px solid #1A1A2E', padding: '0 20px', display: 'flex' }}>
{categories.map(c => (
<button key={c} onClick={() => setFilter(c)} style={{
background: 'transparent', border: 'none',
borderBottom: `2px solid ${filter === c ? '#C77DFF' : 'transparent'}`,
color: filter === c ? '#C77DFF' : '#484860',
padding: '8px 12px', fontFamily: 'inherit', fontSize: 7,
letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase'
}}>{c}</button>
))}
</div>

<div style={{ display: 'flex', height: 'calc(100vh - 110px)', overflow: 'hidden' }}>
<div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
{filtered.map(vendor => {
const col = statusColor(vendor.status);
const catCol = categoryColor(vendor.category);
const active = selected?.id === vendor.id;
return (
<div key={vendor.id} onClick={() => setSelected(active ? null : vendor)}
style={{ background: active ? 'rgba(199,125,255,0.06)' : '#080812', border: `1px solid ${active ? 'rgba(199,125,255,0.4)' : col + '30'}`, borderTop: `2px solid ${col}`, borderRadius: 4, padding: '13px', cursor: 'pointer' }}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
<div>
<div style={{ fontSize: 11, fontWeight: 700, color: '#F0F0FA', marginBottom: 3 }}>{vendor.company_name}</div>
<span style={{ fontSize: 7, color: catCol, border: `1px solid ${catCol}40`, padding: '1px 6px', borderRadius: 2 }}>{vendor.category}</span>
</div>
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
<span style={{ fontSize: 7, color: col, border: `1px solid ${col}`, padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>{vendor.status}</span>
<div style={{ display: 'flex', gap: 2 }}>
{Array.from({ length: 5 }).map((_, i) => (
<div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i < vendor.rating ? '#FFD700' : '#1A1A2E' }} />
))}
</div>
</div>
</div>

{vendor.contact_name && (
<div style={{ fontSize: 8, color: '#8080A0', marginBottom: 4 }}>{vendor.contact_name}</div>
)}

<div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
{vendor.rate_amount > 0 && (
<div>
<div style={{ fontSize: 6, color: '#484860' }}>RATE</div>
<div style={{ fontSize: 9, color: '#C0C0D8', fontWeight: 700 }}>
{vendor.rate_type === 'percentage' ? vendor.rate_amount + '%' :
vendor.rate_type === 'per_sms' ? '$' + vendor.rate_amount + '/sms' :
vendor.rate_type === 'per_record' ? '$' + vendor.rate_amount + '/record' :
vendor.rate_type === 'per_piece' ? '$' + vendor.rate_amount + '/piece' :
'$' + vendor.rate_amount + '/mo'}
</div>
</div>
)}
</div>

<div style={{ fontSize: 8, color: '#484860', lineHeight: 1.5, marginBottom: 8 }}>{vendor.notes}</div>

<div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
{vendor.phone && (
<a href={`tel:${vendor.phone}`} style={{ fontSize: 6, color: '#2ECC71', border: '1px solid #2ECC71', padding: '2px 7px', borderRadius: 2, textDecoration: 'none' }}>CALL</a>
)}
{vendor.email && (
<a href={`mailto:${vendor.email}`} style={{ fontSize: 6, color: '#00E5FF', border: '1px solid #00E5FF', padding: '2px 7px', borderRadius: 2, textDecoration: 'none' }}>EMAIL</a>
)}
{STATUSES.filter(s => s !== vendor.status).map(s => (
<button key={s} onClick={e => { e.stopPropagation(); updateStatus(vendor.id, s); }}
style={{ background: 'transparent', border: `1px solid ${statusColor(s)}`, color: statusColor(s), padding: '2px 7px', borderRadius: 2, fontSize: 6, cursor: 'pointer', fontFamily: 'inherit' }}>
→ {s}
</button>
))}
</div>
</div>
);
})}
</div>
</div>
</div>
</div>
);
}