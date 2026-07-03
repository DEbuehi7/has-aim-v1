'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useMemo, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser-safe';

type Lead = {
  id: number;
  ain: string;
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
  discipline_id: number;
};

function scoreColor(s: number) {
  if (s >= 85) return '#FF3C6E';
  if (s >= 70) return '#FF7820';
  if (s >= 55) return '#FFB800';
  return '#00E5FF';
}

function scoreLabel(s: number) {
  if (s >= 85) return 'CRITICAL';
  if (s >= 70) return 'HIGH';
  if (s >= 55) return 'MEDIUM';
  return 'LOW';
}

function fmt(n: number) {
  if (!n) return '--';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K';
  return '$' + n;
}

export default function Dashboard() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [tracingId, setTracingId] = useState<number | null>(null);

  useEffect(() => {
    if (!supabase) return;

    async function load() {
      const { data } = await supabase
        .from('has_properties')
        .select('*')
        .order('dsa_score', { ascending: false })
        .limit(200);
      setLeads(data || []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function skipTrace(lead: Lead) {
    setTracingId(lead.id);
    try {
      const res = await fetch('/api/skip-trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: lead.id,
          address: lead.address,
          city: 'Los Angeles',
          state: 'CA',
          zip: lead.zip
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Owner: ${data.data.ownerName}\nPhone: ${data.data.phone}\nEmail: ${data.data.email}`);
        setLeads(prev => prev.map(l =>
          l.id === lead.id ? { ...l, phone: data.data.phone } : l
        ));
      } else {
        alert('No match found — try manual lookup');
      }
    } catch {
      alert('Skip trace error — check console');
    }
    setTracingId(null);
  }

  const filters = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'NEW', 'CONTACTED', 'RESPONDED'];

  const filtered = leads.filter(l => {
    if (filter === 'CRITICAL') return l.dsa_score >= 85;
    if (filter === 'HIGH') return l.dsa_score >= 70 && l.dsa_score < 85;
    if (filter === 'MEDIUM') return l.dsa_score >= 55 && l.dsa_score < 70;
    if (['NEW', 'CONTACTED', 'RESPONDED'].includes(filter)) return l.status === filter;
    return true;
  }).filter(l =>
    search === '' ||
    l.address.toLowerCase().includes(search.toLowerCase()) ||
    l.zip.includes(search)
  );

  const stats = {
    total: leads.length,
    critical: leads.filter(l => l.dsa_score >= 85).length,
    high: leads.filter(l => l.dsa_score >= 70 && l.dsa_score < 85).length,
    contacted: leads.filter(l => l.status === 'CONTACTED').length,
    responded: leads.filter(l => l.status === 'RESPONDED').length,
    withPhone: leads.filter(l => l.phone && l.phone !== '+13236894495').length,
  };

  if (loading) return (
    <div style={{
      background: '#04040A', height: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'monospace', color: '#00E5FF',
      fontSize: 14, letterSpacing: '0.2em'
    }}>
      LOADING HAS SENTINEL...
    </div>
  );

  return (
    <div style={{
      background: '#04040A', minHeight: '100vh',
      color: '#F0F0FA', fontFamily: "'Courier New', monospace"
    }}>

      {/* Header */}
      <div style={{
        background: '#080812', borderBottom: '1px solid #1A1A2E',
        padding: '14px 20px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900 }}>
            HAS <span style={{ color: '#00E5FF' }}>SENTINEL</span>
            <span style={{ fontSize: 8, color: '#484860', marginLeft: 10, letterSpacing: '0.2em' }}>
              DSA v2 · SELA · SBI CAPITAL
            </span>
          </div>
          <div style={{ fontSize: 8, color: '#484860', marginTop: 2 }}>
            aim2030app.com · CA RE #02224369 · KW SELA
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            ['TOTAL', stats.total, '#C0C0D8'],
            ['CRITICAL', stats.critical, '#FF3C6E'],
            ['HIGH', stats.high, '#FF7820'],
            ['PHONES', stats.withPhone, '#2ECC71'],
            ['RESPONDED', stats.responded, '#FFD700'],
          ].map(([l, v, c]) => (
            <div key={l as string} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 7, color: '#484860', letterSpacing: '0.15em' }}>{l}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: c as string }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters + Search */}
      <div style={{
        background: '#080812', borderBottom: '1px solid #1A1A2E',
        padding: '0 20px', display: 'flex', alignItems: 'center', gap: 0
      }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: 'transparent', border: 'none',
            borderBottom: `2px solid ${filter === f ? '#00E5FF' : 'transparent'}`,
            color: filter === f ? '#00E5FF' : '#484860',
            padding: '8px 12px', fontFamily: 'inherit',
            fontSize: 7, letterSpacing: '0.12em', cursor: 'pointer'
          }}>{f}</button>
        ))}
        <div style={{ flex: 1 }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search address or zip..."
          style={{
            background: '#0C0C1A', border: '1px solid #1A1A2E',
            color: '#F0F0FA', padding: '5px 10px', fontFamily: 'inherit',
            fontSize: 8, outline: 'none', borderRadius: 2, width: 180
          }}
        />
      </div>

      {/* Lead count */}
      <div style={{
        padding: '8px 20px', fontSize: 7,
        color: '#484860', letterSpacing: '0.15em'
      }}>
        SHOWING {filtered.length} OF {leads.length} LEADS
      </div>

      {/* Lead grid */}
      <div style={{
        padding: '0 16px 16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 10
      }}>
        {filtered.map(lead => {
          const col = scoreColor(lead.dsa_score);
          const hasPhone = lead.phone && lead.phone !== '+13236894495';
          return (
            <div key={lead.id} style={{
              background: '#080812',
              border: `1px solid ${col}30`,
              borderTop: `2px solid ${col}`,
              borderRadius: 4, padding: '12px'
            }}>
              {/* Score + Address */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#F0F0FA', marginBottom: 2 }}>
                    {lead.address}
                  </div>
                  <div style={{ fontSize: 7, color: '#484860' }}>
                    {lead.zip} · {lead.units || '?'} units · {lead.status}
                  </div>
                </div>
                <div style={{ textAlign: 'center', marginLeft: 8 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: col, lineHeight: 1 }}>
                    {lead.dsa_score}
                  </div>
                  <div style={{ fontSize: 6, color: col, letterSpacing: '0.1em' }}>
                    {scoreLabel(lead.dsa_score)}
                  </div>
                </div>
              </div>

              {/* Distress flags */}
              <div style={{ display: 'flex', gap: 3, marginBottom: 8, flexWrap: 'wrap' }}>
                {lead.tax_delinquent && (
                  <span style={{ fontSize: 6, color: '#FF3C6E', border: '1px solid #FF3C6E', padding: '1px 4px', borderRadius: 1 }}>TAX</span>
                )}
                {lead.rent_control && (
                  <span style={{ fontSize: 6, color: '#FFB800', border: '1px solid #FFB800', padding: '1px 4px', borderRadius: 1 }}>RSO</span>
                )}
                {lead.active_violation && (
                  <span style={{ fontSize: 6, color: '#FF3C6E', border: '1px solid #FF3C6E', padding: '1px 4px', borderRadius: 1 }}>VIOLATION</span>
                )}
                {lead.deferred_maint && (
                  <span style={{ fontSize: 6, color: '#C77DFF', border: '1px solid #C77DFF', padding: '1px 4px', borderRadius: 1 }}>NO PERMIT</span>
                )}
              </div>

              {/* Financials */}
              {(lead.arv_estimate > 0 || lead.assignment_fee > 0) && (
                <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 6, color: '#484860' }}>ARV</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#2ECC71' }}>{fmt(lead.arv_estimate)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 6, color: '#484860' }}>FEE</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#F4A261' }}>{fmt(lead.assignment_fee)}</div>
                  </div>
                </div>
              )}

              {/* Phone */}
              <div style={{ marginBottom: 8 }}>
                {hasPhone ? (
                  <div style={{ fontSize: 8, color: '#2ECC71' }}>
                    ✓ {lead.phone}
                  </div>
                ) : (
                  <div style={{ fontSize: 7, color: '#484860' }}>No phone on file</div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 5 }}>
                {hasPhone && (
                  <a href={`tel:${lead.phone}`} style={{
                    flex: 1, textAlign: 'center',
                    background: 'rgba(46,204,113,0.15)',
                    border: '1px solid #2ECC71', color: '#2ECC71',
                    padding: '5px', borderRadius: 2, fontSize: 7,
                    textDecoration: 'none', letterSpacing: '0.1em'
                  }}>CALL</a>
                )}
                <button onClick={() => skipTrace(lead)}
                  disabled={tracingId === lead.id}
                  style={{
                    flex: 1, background: 'rgba(0,229,255,0.15)',
                    border: '1px solid #00E5FF', color: '#00E5FF',
                    padding: '5px', borderRadius: 2, fontSize: 7,
                    cursor: 'pointer', fontFamily: 'inherit',
                    letterSpacing: '0.1em'
                  }}>
                  {tracingId === lead.id ? 'TRACING...' : 'SKIP TRACE'}
                </button>
                <a href={`https://maps.apple.com/?daddr=${encodeURIComponent(lead.address + ', Los Angeles, CA ' + lead.zip)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    flex: 1, textAlign: 'center',
                    background: 'rgba(244,162,97,0.15)',
                    border: '1px solid #F4A261', color: '#F4A261',
                    padding: '5px', borderRadius: 2, fontSize: 7,
                    textDecoration: 'none', letterSpacing: '0.1em'
                  }}>MAP</a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
