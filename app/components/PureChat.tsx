'use client';
import { useState } from 'react';

export default function PureChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{role:string,content:string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    const currentInput = input;
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/pure-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          history: messages.slice(-6)
        })
      });

      const text = await res.text();

      if (!res.ok) {
        setError(`API error ${res.status}: ${text.slice(0,100)}`);
        setLoading(false);
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setError('Parse error: ' + text.slice(0,100));
        setLoading(false);
        return;
      }

      const reply = data.reply || data.error || 'Empty response from Pure';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

    } catch (err: any) {
      setError('Fetch error: ' + (err.message || 'unknown'));
    }
    setLoading(false);
  }

  return (
    <>
      <button onClick={() => setOpen(!open)} style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 1000,
        width: 48, height: 48, borderRadius: '50%',
        background: open ? '#C77DFF' : 'rgba(199,125,255,0.85)',
        border: '2px solid #C77DFF', color: '#F0F0FA',
        fontSize: 16, fontWeight: 900, cursor: 'pointer',
        boxShadow: '0 0 20px rgba(199,125,255,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'monospace', transition: 'all 0.2s'
      }}>
        {open ? '×' : 'P'}
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 80, right: 20, zIndex: 1000,
          width: 320, height: 440, background: '#07070F',
          border: '1px solid #C77DFF', borderRadius: 8,
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Courier New', monospace",
          boxShadow: '0 0 40px rgba(199,125,255,0.15)'
        }}>

          {/* Header */}
          <div style={{
            padding: '10px 14px', borderBottom: '1px solid #181830',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: 9, color: '#C77DFF', letterSpacing: '0.2em', fontWeight: 700 }}>
                PURE · AIM INTELLIGENCE
              </div>
              <div style={{ fontSize: 7, color: '#484860', letterSpacing: '0.1em' }}>
                Live HAS data · Daniel Ebuehi
              </div>
            </div>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ECC71', boxShadow: '0 0 6px #2ECC71' }} />
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
            {messages.length === 0 && (
              <div style={{ fontSize: 8, color: '#484860', lineHeight: 2 }}>
                <div style={{ color: '#C77DFF', marginBottom: 8, fontSize: 7, letterSpacing: '0.15em' }}>
                  SUGGESTED QUERIES
                </div>
                {[
                  'What are my top leads?',
                  'How many deals are active?',
                  'What decisions are pending?',
                  'Status on Weldon Hotel?',
                ].map(q => (
                  <div key={q} onClick={() => { setInput(q); }}
                    style={{ padding: '4px 8px', background: '#101020', borderRadius: 3,
                      marginBottom: 4, cursor: 'pointer', fontSize: 8, color: '#8080A0',
                      border: '1px solid #181830' }}>
                    {q}
                  </div>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} style={{
                marginBottom: 10,
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '85%', padding: '8px 10px', borderRadius: 6,
                  fontSize: 9, lineHeight: 1.7,
                  background: m.role === 'user' ? 'rgba(199,125,255,0.15)' : '#101020',
                  color: m.role === 'user' ? '#C77DFF' : '#C0C0D8',
                  border: `1px solid ${m.role === 'user' ? 'rgba(199,125,255,0.3)' : '#181830'}`
                }}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ fontSize: 8, color: '#484860', fontStyle: 'italic' }}>
                Pure is thinking...
              </div>
            )}

            {error && (
              <div style={{ fontSize: 7, color: '#FF3C6E', background: 'rgba(255,60,110,0.08)',
                border: '1px solid rgba(255,60,110,0.3)', padding: '6px 8px', borderRadius: 3,
                marginTop: 6, lineHeight: 1.6 }}>
                {error}
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '8px 10px', borderTop: '1px solid #181830',
            display: 'flex', gap: 6, alignItems: 'center'
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && send()}
              placeholder="Ask Pure..."
              style={{
                flex: 1, background: '#0A0A16', border: '1px solid #181830',
                color: '#F0F0FA', padding: '7px 10px', fontFamily: 'inherit',
                fontSize: 9, outline: 'none', borderRadius: 4,
                borderColor: input ? '#C77DFF' : '#181830'
              }}
            />
            <button onClick={send} disabled={loading || !input.trim()} style={{
              background: input.trim() ? 'rgba(199,125,255,0.2)' : 'transparent',
              border: `1px solid ${input.trim() ? '#C77DFF' : '#181830'}`,
              color: input.trim() ? '#C77DFF' : '#484860',
              padding: '7px 12px', borderRadius: 4,
              fontSize: 10, cursor: input.trim() ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', transition: 'all 0.15s'
            }}>→</button>
          </div>
        </div>
      )}
    </>
  );
}
