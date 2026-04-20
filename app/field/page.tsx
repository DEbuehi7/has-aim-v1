'use client';export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Lead = {
id: number;
address: string;
zip: string;
units: number;
dsa_score: number;
status: string;
rent_control: boolean;
tax_delinquent: boolean;
active_violation: boolean;
deferred_maint: boolean;
arv_estimate: number;
assignment_fee: number;
phone: string;
};

function scoreColor(s: number) {
if (s >= 85) return '#FF3C6E';
if (s >= 70) return '#FF7820';
if (s >= 55) return '#FFB800';
return '#00E5FF';
}

function fmt(n: number) {
if (!n) return '--';
if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
if (n >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K';
return '$' + n;
}

export default function FieldPage() {
const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const [leads, setLeads] = useState<Lead[]>([]);
const [loading, setLoading] = useState(true);
const [selected, setSelected] = useState<Lead | null>(null);
const [note, setNote] = useState('');
const [saving, setSaving] = useState(false);
const [saved, setSaved] = useState(false);

useEffect(() => {
supabase
.from('has_properties')
.select('id,address,zip,units,dsa_score,status,rent_control,tax_delinquent,active_violation,deferred_maint,arv_estimate,assignment_fee,phone')
.gte('dsa_score', 75)
.order('dsa_score', { ascending: false })
.then(({ data }) => { setLeads(data || []); setLoading(false); });
}, []);

async function logVisit() {
if (!selected || !note.trim()) return;
setSaving(true);
await supabase.from('has_compliance_log').insert({
content_id: String(selected.id),
content_type: 'field_visit',
human_reviewed: true,
review_date: new Date().toISOString(),
approved: true,
reviewer: 'Daniel Ebuehi · CA RE #02224369',
notes: `FIELD VISIT: ${selected.address} — ${note}`,
});
setSaved(true);
setNote('');
setTimeout(() => setSaved(false), 3000);
setSaving(false);
}

async function callSeller() {
if (!selected?.phone) return;
window.location.href = `tel:${selected.phone}`;
}

async function getDirections() {
if (!selected) return;
const addr = encodeURIComponent(`${selected.address}, Los Angeles, CA ${selected.zip}`);
window.open(`https://maps.apple.com/?daddr=${addr}`, '_blank');
}

if (loading) return (
<div style={{ background: '#04040A', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', color: '#F4A261', fontSize: 14, letterSpacing: '0.2em' }}>
LOADING FIELD OPS...
</div>
);

return (
<div style={{ background: '#04040A', minHeight: '100vh', color: '#F0F0FA', fontFamily: "'Courier New', monospace" }}>
<div style={{ background: '#080812', borderBottom: '1px solid #1A1A2E', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
<div>
<div style={{ fontSize: 16, fontWeight: 900 }}>
HAS <span style={{ color: '#F4A261' }}>FIELD OPS</span>
<span style={{ fontSize: 8, color: '#484860', marginLeft: 10, letterSpacing: '0.2em' }}>MOBILE UNIT · PROPERTY VISITS · SELA</span>
</div>
<div style={{ fontSize: 8, color: '#484860', marginTop: 2 }}>CA RE #02224369 · FAA #4229607 · KW SELA</div>
</div>
<div style={{ fontSize: 10, color: '#F4A261', fontWeight: 700 }}>{leads.length} TARGETS IN RANGE</div>
</div>

<div style={{ display: 'flex', height: 'calc(100vh - 72px)', overflow: 'hidden' }}>

{/* Lead list */}
<div style={{ width: 280, flexShrink: 0, borderRight: '1px solid #1A1A2E', overflowY: 'auto' }}>
{leads.map(lead => {
const active = selected?.id === lead.id;
const col = scoreColor(lead.dsa_score);
return (
<div key={lead.id} onClick={() => { setSelected(lead); setNote(''); setSaved(false); }}
style={{ padding: '12px 14px', borderBottom: '1px solid #1A1A2E', cursor: 'pointer', background: active ? 'rgba(244,162,97,0.08)' : 'transparent', borderLeft: `3px solid ${active ? '#F4A261' : 'transparent'}` }}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
<span style={{ fontSize: 9, fontWeight: 700, color: active ? '#F0F0FA' : '#C0C0D8' }}>{lead.address}</span>
<span style={{ fontSize: 10, fontWeight: 900, color: col }}>{lead.dsa_score}</span>
</div>
<div style={{ display: 'flex', gap: 6 }}>
<span style={{ fontSize: 7, color: '#484860' }}>{lead.zip}</span>
<span style={{ fontSize: 7, color: '#484860' }}>{lead.units}u</span>
<span style={{ fontSize: 7, color: lead.status === 'CONTACTED' ? '#FFB800' : '#484860' }}>{lead.status}</span>
</div>
<div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
{lead.tax_delinquent && <span style={{ fontSize: 5, color: '#FF3C6E', border: '1px solid #FF3C6E', padding: '1px 3px', borderRadius: 1 }}>TAX</span>}
{lead.rent_control && <span style={{ fontSize: 5, color: '#FFB800', border: '1px solid #FFB800', padding: '1px 3px', borderRadius: 1 }}>RSO</span>}
{lead.active_violation && <span style={{ fontSize: 5, color: '#FF3C6E', border: '1px solid #FF3C6E', padding: '1px 3px', borderRadius: 1 }}>VIOL</span>}
{lead.deferred_maint && <span style={{ fontSize: 5, color: '#C77DFF', border: '1px solid #C77DFF', padding: '1px 3px', borderRadius: 1 }}>NO PERMIT</span>}
</div>
</div>
);
})}
</div>

{/* Detail panel */}
<div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
{!selected ? (
<div style={{ textAlign: 'center', padding: '80px 20px', color: '#484860', fontSize: 10, letterSpacing: '0.18em' }}>
SELECT A TARGET FROM THE LIST
</div>
) : (
<>
{/* Score */}
<div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
<div style={{ padding: '16px 20px', background: `${scoreColor(selected.dsa_score)}15`, border: `1px solid ${scoreColor(selected.dsa_score)}40`, borderTop: `2px solid ${scoreColor(selected.dsa_score)}`, borderRadius: 4, textAlign: 'center', minWidth: 100 }}>
<div style={{ fontSize: 36, fontWeight: 900, color: scoreColor(selected.dsa_score) }}>{selected.dsa_score}</div>
<div style={{ fontSize: 7, color: scoreColor(selected.dsa_score), letterSpacing: '0.15em' }}>DSA SCORE</div>
</div>
<div style={{ flex: 1 }}>
<div style={{ fontSize: 16, fontWeight: 900, color: '#F0F0FA', marginBottom: 4 }}>{selected.address}</div>
<div style={{ fontSize: 10, color: '#8080A0', marginBottom: 12 }}>{selected.zip} · {selected.units} units · {selected.status}</div>
<div style={{ display: 'flex', gap: 8 }}>
<div style={{ textAlign: 'center' }}>
<div style={{ fontSize: 7, color: '#484860' }}>ARV</div>
<div style={{ fontSize: 12, fontWeight: 700, color: '#2ECC71' }}>{fmt(selected.arv_estimate)}</div>
</div>
<div style={{ textAlign: 'center' }}>
<div style={{ fontSize: 7, color: '#484860' }}>FEE</div>
<div style={{ fontSize: 12, fontWeight: 700, color: '#F4A261' }}>{fmt(selected.assignment_fee)}</div>
</div>
</div>
</div>
</div>

{/* Action buttons */}
<div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
<button onClick={getDirections} style={{ flex: 1, background: 'rgba(244,162,97,0.15)', border: '1px solid #F4A261', color: '#F4A261', padding: '10px', borderRadius: 3, fontSize: 9, letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
DIRECTIONS →
</button>
<button onClick={callSeller} style={{ flex: 1, background: 'rgba(46,204,113,0.15)', border: '1px solid #2ECC71', color: '#2ECC71', padding: '10px', borderRadius: 3, fontSize: 9, letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
CALL SELLER
</button>
</div>

{/* Field notes */}
<div style={{ marginBottom: 12 }}>
<div style={{ fontSize: 7, color: '#484860', letterSpacing: '0.15em', marginBottom: 6 }}>FIELD NOTES</div>
<textarea value={note} onChange={e => setNote(e.target.value)}
placeholder="Condition of property, owner present, photos taken, next steps..."
rows={4}
style={{ width: '100%', background: '#080812', border: '1px solid #1A1A2E', borderLeft: '2px solid #F4A261', color: '#F0F0FA', padding: '10px 12px', fontFamily: 'inherit', fontSize: 10, resize: 'none', outline: 'none', borderRadius: 3, boxSizing: 'border-box' }} />
</div>

<button onClick={logVisit} disabled={!note.trim() || saving}
style={{ width: '100%', background: saved ? 'rgba(46,204,113,0.15)' : 'rgba(244,162,97,0.15)', border: `1px solid ${saved ? '#2ECC71' : '#F4A261'}`, color: saved ? '#2ECC71' : '#F4A261', padding: '10px', borderRadius: 3, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: !note.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
{saved ? '✓ VISIT LOGGED' : saving ? 'LOGGING...' : '→ LOG FIELD VISIT'}
</button>
</>
)}
</div>
</div>
</div>
);
}