'use client';
import { useState } from 'react';

export default function PureChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{role:string,content:string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/pure-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: messages })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error — try again.' }]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* Toggle button */}
      <button onClick={() => setOpen(!open)} style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 1000,
        width: 48, height: 48, borderRadius: '50%',
        background: 'rgba(199,125,255,0.9)',
        border: '1px solid #C77DFF',
        color: '#F0F0FA', fontSize: 18, cursor: 'pointer',
        boxShadow: '0 0 20px rgba(199,125,255,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'monospace'
      }}>
        {open ? '×' : 'P'}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 80, right: 20, zIndex: 1000,
          width: 320, height: 420, background: '#07070F',
          border: '1px solid #C77DFF', borderRadius: 8,
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Courier New', monospace",
          boxShadow: '0 0 30px rgba(199,125,255,0.2)'
        }}>
          {/* Header */}
          <div style={{
            padding: '10px 14px', borderBottom: '1px solid #181830',
            fontSize: 9, color: '#C77DFF', letterSpacing: '0.2em', fontWeight: 700
          }}>
            PURE · AIM INTELLIGENCE LAYER
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
            {messages.length === 0 && (
              <div style={{ fontSize: 8, color: '#484860', lineHeight: 1.8 }}>
                Ask me anything about your HAS system.<br/>
                "What are my top leads?"<br/>
                "Status on active deals?"<br/>
                "Pending decisions?"
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                marginBottom: 8,
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '80%', padding: '6px 10px', borderRadius: 6,
                  fontSize: 9, lineHeight: 1.6,
                  background: m.role === 'user' ? 'rgba(199,125,255,0.2)' : '#101020',
                  color: m.role === 'user' ? '#C77DFF' : '#C0C0D8',
                  border: `1px solid ${m.role === 'user' ? 'rgba(199,125,255,0.4)' : '#181830'}`
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ fontSize: 8, color: '#484860' }}>Pure is thinking...</div>
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '8px 10px', borderTop: '1px solid #181830',
            display: 'flex', gap: 6
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask Pure..."
              style={{
                flex: 1, background: '#0A0A16', border: '1px solid #181830',
                color: '#F0F0FA', padding: '6px 8px', fontFamily: 'inherit',
                fontSize: 9, outline: 'none', borderRadius: 4
              }}
            />
            <button onClick={send} disabled={loading} style={{
              background: 'rgba(199,125,255,0.2)', border: '1px solid #C77DFF',
              color: '#C77DFF', padding: '6px 10px', borderRadius: 4,
              fontSize: 8, cursor: 'pointer', fontFamily: 'inherit'
            }}>→</button>
          </div>
        </div>
      )}
    </>
  );
}
