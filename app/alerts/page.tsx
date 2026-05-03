'use client';
export const dynamic = 'force-dynamic';
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
  const [expanded, setExpanded] = useState<number | null>(null);

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
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

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
    if (t === 'skip_trace') return '#C77DFF';
    if (t === 'field_visit') return '#F4A261';
    return '#FFB800';
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  if (loading) return (
    <div style={{
      background: '#04040A', height: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'monospace', color: '#FF3C6E',
      fontSize: 14, letterSpacing: '0.2em'
    }}>
      LOADING ALERT FEED...
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
          <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.06em' }}>
            HAS <span style={{ color: '#FF3C6E' }}>ALERTS</span>
            <span style={{ fontSize: 8, color: '#484860', marginLeft: 10, letterSpacing: '0.2em' }}>
              COMPLIANCE LOG · INBOUND FEED · LIVE
            </span>
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
      <div style={{
        background: '#080812', borderBottom: '1px solid #1A1A2E',
        padding: '0 20px', display: 'flex'
      }}>
        {uniqueTypes.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            background: 'transparent', border: 'none',
            borderBottom: `2px solid ${filter === t ? typeColor(t) : 'transparent'}`,
            color: filter === t ? typeColor(t) : '#484860',
            padding: '8px 14px', fontFamily: 'inherit', fontSize: 8,
            letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase'
          }}>{t === 'ALL' ? 'ALL' : t.replace(/_/g, ' ')}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', padding: '0 14px' }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#FF3C6E', boxShadow: '0 0 6px #FF3C6E'
          }} />
          <span style={{ fontSize: 7, color: '#FF3C6E', marginLeft: 6, letterSpacing: '0.15em' }}>LIVE</span>
        </div>
      </div>

      {/* Alert feed */}
      <div style={{ padding: '16px', maxWidth: 900, margin: '0 auto' }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px',
            color: '#484860', fontSize: 10, letterSpacing: '0.18em'
          }}>
            NO ALERTS YET
          </div>
        ) : (
          filtered.map(alert => (
            <div key={alert.id}
              onClick={() => setExpanded(expanded === alert.id ? null : alert.id)}
              style={{
                background: expanded === alert.id
                  ? `${typeColor(alert.content_type)}08` : '#080812',
                border: `1px solid ${typeColor(alert.content_type)}30`,
                borderLeft: `3px solid ${typeColor(alert.content_type)}`,
                borderRadius: 3, padding: '12px 14px',
                marginBottom: 8, cursor: 'pointer'
              }}>

              {/* Row header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 6
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 7, color: typeColor(alert.content_type),
                    border: `1px solid ${typeColor(alert.content_type)}`,
                    padding: '1px 6px', borderRadius: 2,
                    letterSpacing: '0.1em', fontWeight: 700
                  }}>{alert.content_type.replace(/_/g, ' ').toUpperCase()}</span>
                  <span style={{ fontSize: 8, color: '#484860' }}>ID: {alert.content_id}</span>
                  {alert.content_type === 'sms_response' && (
                    <span style={{
                      fontSize: 7, color: '#FF3C6E',
                      background: 'rgba(255,60,110,0.1)',
                      padding: '1px 6px', borderRadius: 2
                    }}>INBOUND</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 8, color: '#484860' }}>
                    {formatTime(alert.review_date)}
                  </span>
                  <span style={{ fontSize: 8, color: '#484860' }}>
                    {expanded === alert.id ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div style={{ fontSize: 10, color: '#C0C0D8', lineHeight: 1.6 }}>
                {alert.notes}
              </div>

              {/* Expanded detail */}
              {expanded === alert.id && (
                <div style={{
                  marginTop: 10, padding: '10px',
                  background: '#0C0C1A', borderRadius: 3,
                  border: '1px solid #1A1A2E'
                }}>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 7, color: '#484860' }}>REVIEWED</div>
                      <div style={{
                        fontSize: 9,
                        color: alert.human_reviewed ? '#2ECC71' : '#484860'
                      }}>
                        {alert.human_reviewed ? '✓ YES' : '○ NO'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 7, color: '#484860' }}>APPROVED</div>
                      <div style={{
                        fontSize: 9,
                        color: alert.approved ? '#2ECC71' : '#484860'
                      }}>
                        {alert.approved ? '✓ YES' : '○ NO'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 7, color: '#484860' }}>CONTENT ID</div>
                      <div style={{ fontSize: 9, color: '#C0C0D8' }}>{alert.content_id}</div>
                    </div>
                  </div>

                  {/* Action buttons for inbound SMS */}
                  {alert.content_type === 'sms_response' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a href={`tel:${alert.content_id}`}
                        onClick={e => e.stopPropagation()}
                        style={{
                          flex: 1, textAlign: 'center',
                          background: 'rgba(46,204,113,0.15)',
                          border: '1px solid #2ECC71', color: '#2ECC71',
                          padding: '6px', borderRadius: 2, fontSize: 7,
                          textDecoration: 'none', letterSpacing: '0.1em'
                        }}>
                        CALL BACK
                      </a>
                      <a href={`sms:${alert.content_id}`}
                        onClick={e => e.stopPropagation()}
                        style={{
                          flex: 1, textAlign: 'center',
                          background: 'rgba(0,229,255,0.15)',
                          border: '1px solid #00E5FF', color: '#00E5FF',
                          padding: '6px', borderRadius: 2, fontSize: 7,
                          textDecoration: 'none', letterSpacing: '0.1em'
                        }}>
                        SMS BACK
                      </a>
                    </div>
                  )}

                  {/* Action buttons for outreach SMS */}
                  {alert.content_type === 'outreach_sms' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a href={`tel:${alert.content_id}`}
                        onClick={e => e.stopPropagation()}
                        style={{
                          flex: 1, textAlign: 'center',
                          background: 'rgba(244,162,97,0.15)',
                          border: '1px solid #F4A261', color: '#F4A261',
                          padding: '6px', borderRadius: 2, fontSize: 7,
                          textDecoration: 'none', letterSpacing: '0.1em'
                        }}>
                        CALL SELLER
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:0.3;transform:scale(0.5)}
        }
      `}</style>
    </div>
  );
}
