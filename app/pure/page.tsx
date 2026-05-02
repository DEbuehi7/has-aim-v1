'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Identity = {
  id: number;
  entity_type: string;
  legal_name: string;
  ein: string;
  license_number: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  notes: string;
};

type Decision = {
  id: number;
  title: string;
  context: string;
  recommended: string;
  priority: string;
  status: string;
};

export default function PurePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vault');

  useEffect(() => {
    async function load() {
      const [{ data: ids }, { data: decs }] = await Promise.all([
        supabase.from('pure_identity').select('*').order('id'),
        supabase.from('pure_decision_queue').select('*').order('created_at', { ascending: false }),
      ]);
      setIdentities(ids || []);
      setDecisions(decs || []);
      setLoading(false);
    }
    load();
  }, []);

  async function updateDecision(id: number, status: string) {
    await supabase.from('pure_decision_queue')
      .update({ status, decided_by: 'Daniel Ebuehi', decided_at: new Date().toISOString() })
      .eq('id', id);
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  }

  const priorityColor = (p: string) => {
    if (p === 'HIGH') return '#FF3C6E';
    if (p === 'MEDIUM') return '#FFB800';
    return '#00E5FF';
  };

  const statusColor = (s: string) => {
    if (s === 'APPROVED') return '#2ECC71';
    if (s === 'REJECTED') return '#FF3C6E';
    if (s === 'PENDING') return '#FFB800';
    return '#484860';
  };

  const entityColor = (e: string) => {
    if (e === 'C-CORP') return '#FFD700';
    if (e === 'LLC') return '#00E5FF';
    if (e === 'INDIVIDUAL') return '#2ECC71';
    if (e === 'BROKERAGE') return '#C77DFF';
    return '#484860';
  };

  if (loading) return (
    <div style={{ background: '#04040A', height: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'monospace', color: '#C77DFF', fontSize: 14,
      letterSpacing: '0.2em' }}>
      LOADING PURE VAULT...
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
          <div style={{ fontSize: 16, fontWeight: 900 }}>
            PURE <span style={{ color: '#C77DFF' }}>VAULT</span>
            <span style={{ fontSize: 8, color: '#484860', marginLeft: 10,
              letterSpacing: '0.2em' }}>IDENTITY · DECISIONS · DOCUMENTS · SBI CAPITAL</span>
          </div>
          <div style={{ fontSize: 8, color: '#484860', marginTop: 2 }}>
            CANONICAL ENTITY REGISTRY · EDO FRAMEWORK · aim2030app.com
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            ['ENTITIES', identities.length, '#C77DFF'],
            ['DECISIONS', decisions.filter(d => d.status === 'PENDING').length, '#FFB800'],
          ].map(([l, v, c]) => (
            <div key={l as string} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 7, color: '#484860', letterSpacing: '0.15em' }}>{l}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: c as string }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#080812', borderBottom: '1px solid #1A1A2E',
        display: 'flex' }}>
        {[['vault', 'Identity Vault'], ['decisions', 'Decision Queue'], ['activity', 'Activity Log']].map(([k, l]) => (
          <button key={k} onClick={() => setActiveTab(k)} style={{
            background: 'transparent', border: 'none',
            borderBottom: `2px solid ${activeTab === k ? '#C77DFF' : 'transparent'}`,
            color: activeTab === k ? '#C77DFF' : '#484860',
            padding: '9px 20px', fontFamily: 'inherit',
            fontSize: 8, letterSpacing: '0.14em', cursor: 'pointer' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Identity Vault */}
      {activeTab === 'vault' && (
        <div style={{ padding: '16px' }}>
          <div style={{ fontSize: 7, letterSpacing: '0.2em', color: '#484860',
            marginBottom: 10 }}>CANONICAL ENTITY REGISTRY · SBI CAPITAL ECOSYSTEM</div>
          {identities.map(entity => (
            <div key={entity.id} style={{ marginBottom: 10, padding: '13px 15px',
              background: '#080812',
              border: `1px solid ${entityColor(entity.entity_type)}30`,
              borderLeft: `3px solid ${entityColor(entity.entity_type)}`,
              borderRadius: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: '#F0F0FA' }}>
                  {entity.legal_name}
                </div>
                <span style={{ fontSize: 7,
                  color: entityColor(entity.entity_type),
                  border: `1px solid ${entityColor(entity.entity_type)}`,
                  padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
                  {entity.entity_type}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 6 }}>
                {[
                  ['EIN', entity.ein],
                  ['LICENSE', entity.license_number],
                  ['PHONE', entity.phone],
                  ['EMAIL', entity.email],
                  ['LOCATION', `${entity.city}, ${entity.state}`],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} style={{ padding: '4px 8px',
                    background: '#0C0C1A', borderRadius: 2 }}>
                    <div style={{ fontSize: 6, color: '#484860',
                      letterSpacing: '0.12em' }}>{k}</div>
                    <div style={{ fontSize: 9, color: '#C0C0D8',
                      fontWeight: 700 }}>{v}</div>
                  </div>
                ))}
              </div>
              {entity.notes && (
                <div style={{ fontSize: 8, color: '#484860',
                  marginTop: 8, lineHeight: 1.5 }}>{entity.notes}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Decision Queue */}
      {activeTab === 'decisions' && (
        <div style={{ padding: '16px' }}>
          <div style={{ fontSize: 7, letterSpacing: '0.2em', color: '#484860',
            marginBottom: 10 }}>PENDING DECISIONS · ONE-TAP APPROVAL</div>
          {decisions.map(dec => (
            <div key={dec.id} style={{ marginBottom: 10, padding: '13px 15px',
              background: '#080812',
              border: `1px solid ${priorityColor(dec.priority)}30`,
              borderLeft: `3px solid ${priorityColor(dec.priority)}`,
              borderRadius: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700,
                  color: '#F0F0FA' }}>{dec.title}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ fontSize: 7,
                    color: priorityColor(dec.priority),
                    border: `1px solid ${priorityColor(dec.priority)}`,
                    padding: '1px 6px', borderRadius: 2 }}>{dec.priority}</span>
                  <span style={{ fontSize: 7,
                    color: statusColor(dec.status),
                    border: `1px solid ${statusColor(dec.status)}`,
                    padding: '1px 6px', borderRadius: 2 }}>{dec.status}</span>
                </div>
              </div>
              <div style={{ fontSize: 9, color: '#8080A0',
                marginBottom: 6, lineHeight: 1.6 }}>{dec.context}</div>
              {dec.recommended && (
                <div style={{ fontSize: 8, color: '#2ECC71',
                  marginBottom: 10, padding: '6px 8px',
                  background: 'rgba(46,204,113,0.08)',
                  border: '1px solid rgba(46,204,113,0.25)',
                  borderRadius: 3 }}>
                  ✓ RECOMMENDED: {dec.recommended}
                </div>
              )}
              {dec.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => updateDecision(dec.id, 'APPROVED')}
                    style={{ flex: 1, background: 'rgba(46,204,113,0.15)',
                      border: '1px solid #2ECC71', color: '#2ECC71',
                      padding: '7px', borderRadius: 3, fontSize: 8,
                      cursor: 'pointer', fontFamily: 'inherit',
                      fontWeight: 700 }}>
                    ✓ APPROVE
                  </button>
                  <button onClick={() => updateDecision(dec.id, 'REJECTED')}
                    style={{ flex: 1, background: 'rgba(255,60,110,0.15)',
                      border: '1px solid #FF3C6E', color: '#FF3C6E',
                      padding: '7px', borderRadius: 3, fontSize: 8,
                      cursor: 'pointer', fontFamily: 'inherit',
                      fontWeight: 700 }}>
                    ✕ REJECT
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Activity Log */}
      {activeTab === 'activity' && (
        <div style={{ padding: '16px', textAlign: 'center',
          color: '#484860', fontSize: 10, letterSpacing: '0.18em',
          paddingTop: 60 }}>
          ACTIVITY LOG POPULATES AS SYSTEM EVENTS OCCUR
        </div>
      )}
    </div>
  );
}
