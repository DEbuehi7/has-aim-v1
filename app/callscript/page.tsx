'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Lead = {
  id: number;
  address: string;
  zip: string;
  phone: string;
  dsa_score: number;
  status: string;
  active_violation: boolean;
  tax_delinquent: boolean;
  rent_control: boolean;
};

export default function CallScriptPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('has_properties')
      .select('id,address,zip,phone,dsa_score,status,active_violation,tax_delinquent,rent_control')
      .not('phone', 'is', null)
      .neq('phone', '+13236894495')
      .order('dsa_score', { ascending: false })
      .limit(50)
      .then(({ data }) => { setLeads(data || []); setLoading(false); });
  }, []);

  function getScript(lead: Lead, name: string) {
    const firstName = name.split(' ')[0] || 'there';
    const distress = lead.active_violation
      ? 'city enforcement notice'
      : lead.tax_delinquent
      ? 'property tax situation'
      : 'property';

    return {
      opener: `Hi, is this ${firstName}? This is Daniel Ebuehi — I'm a licensed real estate professional with Keller Williams in South Los Angeles. CA license number 02224369. I reached out recently about your property at ${lead.address}. Do you have 5 minutes?`,
      qualify: `I specialize in helping property owners in Southeast LA who are dealing with ${distress} find a quick solution — whether that's a fast sale, management relief, or repairs coordination. Can I ask — how long have you owned the property?`,
      pivot: `That makes sense. Have you ever considered selling, or are you looking to hold onto it long term?`,
      offer: `I work with cash buyers who can close in as little as 10 days — no repairs needed, no agent fees, no hassle. Would you be open to hearing what a fair cash offer might look like?`,
      voicemail: `Hi ${firstName}, this is Daniel Ebuehi from KW South LA — license 02224369. I sent you a message about your property at ${lead.address}. I may have a solution that could help. Call or text me at 323-689-4495. No pressure at all.`,
    };
  }

  const script = selected ? getScript(selected, ownerName) : null;

  if (loading) return (
    <div style={{ background: '#04040A', height: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace',
      color: '#2ECC71', fontSize: 14, letterSpacing: '0.2em' }}>
      LOADING CALL SCRIPTS...
    </div>
  );

  return (
    <div style={{ background: '#04040A', minHeight: '100vh', color: '#F0F0FA',
      fontFamily: "'Courier New', monospace" }}>

      <div style={{ background: '#080812', borderBottom: '1px solid #1A1A2E',
        padding: '14px 20px' }}>
        <div style={{ fontSize: 16, fontWeight: 900 }}>
          HAS <span style={{ color: '#2ECC71' }}>CALL SCRIPTS</span>
          <span style={{ fontSize: 8, color: '#484860', marginLeft: 10 }}>
            LIVE LEAD DATA · PERSONALIZED SCRIPTS · CA RE #02224369
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>

        {/* Lead list */}
        <div style={{ width: 240, flexShrink: 0, borderRight: '1px solid #1A1A2E',
          overflowY: 'auto', background: '#080812' }}>
          <div style={{ padding: '8px 12px', fontSize: 7, color: '#484860',
            letterSpacing: '0.15em', borderBottom: '1px solid #1A1A2E' }}>
            SELECT LEAD TO CALL
          </div>
          {leads.map(lead => (
            <div key={lead.id} onClick={() => { setSelected(lead); setOwnerName(''); }}
              style={{ padding: '10px 12px', borderBottom: '1px solid #1A1A2E',
                cursor: 'pointer', background: selected?.id === lead.id
                  ? 'rgba(46,204,113,0.08)' : 'transparent',
                borderLeft: `3px solid ${selected?.id === lead.id ? '#2ECC71' : 'transparent'}` }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#F0F0FA',
                marginBottom: 2 }}>{lead.address}</div>
              <div style={{ fontSize: 7, color: '#484860' }}>
                DSA {lead.dsa_score} · {lead.status}
              </div>
              <div style={{ fontSize: 8, color: '#2ECC71', marginTop: 2 }}>
                {lead.phone}
              </div>
            </div>
          ))}
        </div>

        {/* Script panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {!selected ? (
            <div style={{ textAlign: 'center', padding: '60px',
              color: '#484860', fontSize: 10, letterSpacing: '0.18em' }}>
              SELECT A LEAD TO SEE PERSONALIZED SCRIPT
            </div>
          ) : (
            <>
              {/* Lead header */}
              <div style={{ padding: '12px 14px', background: '#080812',
                border: '1px solid rgba(46,204,113,0.3)',
                borderTop: '2px solid #2ECC71', borderRadius: 4, marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#F0F0FA',
                  marginBottom: 4 }}>{selected.address}</div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 7, color: '#484860' }}>DSA SCORE</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#2ECC71' }}>
                      {selected.dsa_score}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 7, color: '#484860' }}>PHONE</div>
                    <a href={`tel:${selected.phone}`} style={{ fontSize: 12,
                      fontWeight: 700, color: '#2ECC71', textDecoration: 'none' }}>
                      {selected.phone}
                    </a>
                  </div>
                  <div>
                    <div style={{ fontSize: 7, color: '#484860' }}>STATUS</div>
                    <div style={{ fontSize: 10, color: '#FFB800' }}>{selected.status}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {selected.active_violation && (
                    <span style={{ fontSize: 6, color: '#FF3C6E',
                      border: '1px solid #FF3C6E', padding: '1px 5px', borderRadius: 1 }}>
                      ACTIVE VIOLATION
                    </span>
                  )}
                  {selected.tax_delinquent && (
                    <span style={{ fontSize: 6, color: '#FF3C6E',
                      border: '1px solid #FF3C6E', padding: '1px 5px', borderRadius: 1 }}>
                      TAX DELINQUENT
                    </span>
                  )}
                  {selected.rent_control && (
                    <span style={{ fontSize: 6, color: '#FFB800',
                      border: '1px solid #FFB800', padding: '1px 5px', borderRadius: 1 }}>
                      RSO
                    </span>
                  )}
                </div>
              </div>

              {/* Owner name input */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 7, color: '#484860', letterSpacing: '0.15em',
                  marginBottom: 6 }}>OWNER NAME (TYPE TO PERSONALIZE SCRIPT)</div>
                <input value={ownerName} onChange={e => setOwnerName(e.target.value)}
                  placeholder="e.g. Victor Vizueto"
                  style={{ width: '100%', background: '#080812',
                    border: '1px solid #2ECC71', color: '#F0F0FA',
                    padding: '8px 12px', fontFamily: 'inherit', fontSize: 10,
                    outline: 'none', borderRadius: 3, boxSizing: 'border-box' }} />
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <a href={`tel:${selected.phone}`} style={{
                  flex: 1, textAlign: 'center',
                  background: 'rgba(46,204,113,0.15)',
                  border: '1px solid #2ECC71', color: '#2ECC71',
                  padding: '10px', borderRadius: 3, fontSize: 9,
                  textDecoration: 'none', letterSpacing: '0.12em', fontWeight: 700
                }}>CALL NOW →</a>
                <a href={`https://maps.apple.com/?daddr=${encodeURIComponent(selected.address + ' Los Angeles CA ' + selected.zip)}`}
                  target="_blank" rel="noopener noreferrer" style={{
                  flex: 1, textAlign: 'center',
                  background: 'rgba(244,162,97,0.15)',
                  border: '1px solid #F4A261', color: '#F4A261',
                  padding: '10px', borderRadius: 3, fontSize: 9,
                  textDecoration: 'none', letterSpacing: '0.12em', fontWeight: 700
                }}>DIRECTIONS →</a>
              </div>

              {/* Scripts */}
              {script && [
                ['OPENER', script.opener, '#2ECC71'],
                ['QUALIFY', script.qualify, '#00E5FF'],
                ['PIVOT', script.pivot, '#FFB800'],
                ['MAKE OFFER', script.offer, '#FF3C6E'],
                ['VOICEMAIL', script.voicemail, '#C77DFF'],
              ].map(([label, text, color]) => (
                <div key={label as string} style={{ marginBottom: 10, padding: '12px 14px',
                  background: '#080812', border: `1px solid ${color}30`,
                  borderLeft: `3px solid ${color}`, borderRadius: 3 }}>
                  <div style={{ fontSize: 7, color: color as string,
                    letterSpacing: '0.18em', fontWeight: 700, marginBottom: 8 }}>
                    {label as string}
                  </div>
                  <div style={{ fontSize: 10, color: '#C0C0D8', lineHeight: 1.8 }}>
                    {text as string}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
