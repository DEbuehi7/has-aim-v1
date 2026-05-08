'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Contact = {
  id: number;
  name: string;
  phone: string;
  email: string;
  contact_type: string;
  zip: string;
  source: string;
  notes: string;
  created_at: string;
};

function typeColor(t: string) {
  if (t === 'SELLER') return '#FF3C6E';
  if (t === 'BUYER') return '#2ECC71';
  if (t === 'AGENT') return '#00E5FF';
  if (t === 'INVESTOR') return '#FFD700';
  if (t === 'PARTNER') return '#C77DFF';
  return '#484860';
}

export default function ContactsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('has_contacts').select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setContacts(data || []); setLoading(false); });
  }, []);

  const types = ['ALL', 'SELLER', 'BUYER', 'AGENT', 'INVESTOR', 'PARTNER'];
  const filtered = contacts
    .filter(c => filter === 'ALL' || c.contact_type === filter)
    .filter(c => search === '' ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) ||
      c.zip?.includes(search));

  const stats = {
    total: contacts.length,
    sellers: contacts.filter(c => c.contact_type === 'SELLER').length,
    buyers: contacts.filter(c => c.contact_type === 'BUYER').length,
    agents: contacts.filter(c => c.contact_type === 'AGENT').length,
  };

  if (loading) return (
    <div style={{ background: '#04040A', height: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'monospace', color: '#00E5FF',
      fontSize: 14, letterSpacing: '0.2em' }}>
      LOADING CONTACTS...
    </div>
  );

  return (
    <div style={{ background: '#04040A', minHeight: '100vh',
      color: '#F0F0FA', fontFamily: "'Courier New', monospace" }}>

      <div style={{ background: '#080812', borderBottom: '1px solid #1A1A2E',
        padding: '14px 20px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900 }}>
            HAS <span style={{ color: '#00E5FF' }}>CONTACTS</span>
            <span style={{ fontSize: 8, color: '#484860', marginLeft: 10 }}>
              SELLERS · BUYERS · AGENTS · INVESTORS
            </span>
          </div>
          <div style={{ fontSize: 8, color: '#484860', marginTop: 2 }}>
            KW SELA · SBI CAPITAL · aim2030app.com
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            ['TOTAL', stats.total, '#C0C0D8'],
            ['SELLERS', stats.sellers, '#FF3C6E'],
            ['BUYERS', stats.buyers, '#2ECC71'],
            ['AGENTS', stats.agents, '#00E5FF'],
          ].map(([l, v, c]) => (
            <div key={l as string} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 7, color: '#484860' }}>{l}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: c as string }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#080812', borderBottom: '1px solid #1A1A2E',
        padding: '0 20px', display: 'flex', alignItems: 'center' }}>
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            background: 'transparent', border: 'none',
            borderBottom: `2px solid ${filter === t ? typeColor(t) : 'transparent'}`,
            color: filter === t ? typeColor(t) : '#484860',
            padding: '8px 12px', fontFamily: 'inherit',
            fontSize: 7, letterSpacing: '0.12em', cursor: 'pointer'
          }}>{t}</button>
        ))}
        <div style={{ flex: 1 }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search name, phone, zip..."
          style={{ background: '#0C0C1A', border: '1px solid #1A1A2E',
            color: '#F0F0FA', padding: '5px 10px', fontFamily: 'inherit',
            fontSize: 8, outline: 'none', borderRadius: 2, width: 180 }} />
      </div>

      <div style={{ padding: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 8 }}>
        {filtered.map(contact => (
          <div key={contact.id} style={{ background: '#080812',
            border: `1px solid ${typeColor(contact.contact_type)}30`,
            borderTop: `2px solid ${typeColor(contact.contact_type)}`,
            borderRadius: 4, padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700,
                  color: '#F0F0FA', marginBottom: 3 }}>{contact.name}</div>
                <span style={{ fontSize: 7,
                  color: typeColor(contact.contact_type),
                  border: `1px solid ${typeColor(contact.contact_type)}`,
                  padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
                  {contact.contact_type}
                </span>
              </div>
              <div style={{ fontSize: 7, color: '#484860' }}>
                {contact.zip}
              </div>
            </div>

            {contact.phone && (
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 7, color: '#484860', marginBottom: 2 }}>PHONE</div>
                <a href={`tel:${contact.phone}`} style={{ fontSize: 10,
                  color: '#2ECC71', textDecoration: 'none', fontWeight: 700 }}>
                  {contact.phone}
                </a>
              </div>
            )}

            {contact.email && (
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 7, color: '#484860', marginBottom: 2 }}>EMAIL</div>
                <a href={`mailto:${contact.email}`} style={{ fontSize: 9,
                  color: '#00E5FF', textDecoration: 'none' }}>
                  {contact.email}
                </a>
              </div>
            )}

            {contact.notes && (
              <div style={{ fontSize: 8, color: '#484860',
                lineHeight: 1.5, marginTop: 6,
                borderTop: '1px solid #1A1A2E', paddingTop: 6 }}>
                {contact.notes}
              </div>
            )}

            <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
              {contact.phone && (
                <a href={`tel:${contact.phone}`} style={{
                  flex: 1, textAlign: 'center',
                  background: 'rgba(46,204,113,0.15)',
                  border: '1px solid #2ECC71', color: '#2ECC71',
                  padding: '5px', borderRadius: 2, fontSize: 7,
                  textDecoration: 'none' }}>CALL</a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} style={{
                  flex: 1, textAlign: 'center',
                  background: 'rgba(0,229,255,0.15)',
                  border: '1px solid #00E5FF', color: '#00E5FF',
                  padding: '5px', borderRadius: 2, fontSize: 7,
                  textDecoration: 'none' }}>EMAIL</a>
              )}
              {contact.phone && (
                <a href={`sms:${contact.phone}`} style={{
                  flex: 1, textAlign: 'center',
                  background: 'rgba(255,60,110,0.15)',
                  border: '1px solid #FF3C6E', color: '#FF3C6E',
                  padding: '5px', borderRadius: 2, fontSize: 7,
                  textDecoration: 'none' }}>SMS</a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
