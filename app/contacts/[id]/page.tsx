"use client";

import { useEffect, useState } from ‘react’;
import { useParams, useRouter } from ‘next/navigation’;

type Contact = {
id: number;
full_name: string;
phone_primary: string | null;
email: string | null;
role: string | null;
status: string | null;
call_attempts: number;
dnc: boolean;
notes: string | null;
property_id: number | null;
mailing_address: string | null;
};

const STATUSES = [‘NEW’,‘CALLED’,‘VOICEMAIL’,‘CALLBACK’,‘INTERESTED’,‘NOT_INTERESTED’,‘DNC’];

const SCRIPT = {
intro: (name: string) =>
`"Hi, may I speak with ${name}? My name is Daniel with AIM Capital. I'm reaching out because we work with property owners in your area and I wanted to have a quick conversation about your property."`,
motivated:
`"We've been helping owners in similar situations explore their options — whether that's selling, refinancing, or just understanding what the property is worth today. Would you be open to a 5-minute conversation?"`,
voicemail: (name: string) =>
`"Hi ${name}, this is Daniel with AIM Capital. I'm reaching out about your property and wanted to connect. Please call me back at your convenience at 323-689-4495. Thank you."`,
objection_not_selling:
`"Totally understand — I'm not here to pressure you at all. We work with a lot of owners who aren't actively looking to sell but find it valuable to just know what their options are. Would it be okay if I followed up in a few months?"`,
objection_not_interested:
`"No problem at all. I appreciate your time. Have a great day."`,
};

export default function CallScriptPage() {
const { id } = useParams();
const router = useRouter();
const [contact, setContact] = useState<Contact | null>(null);
const [loading, setLoading] = useState(true);
const [notes, setNotes] = useState(’’);
const [status, setStatus] = useState(’’);
const [saving, setSaving] = useState(false);
const [saved, setSaved] = useState(false);

useEffect(() => {
fetch(’/api/contacts’)
.then(r => r.json())
.then((data: Contact[]) => {
const c = data.find(x => x.id === Number(id));
if (c) { setContact(c); setNotes(c.notes ?? ‘’); setStatus(c.status ?? ‘NEW’); }
setLoading(false);
})
.catch(() => setLoading(false));
}, [id]);

const handleSave = async () => {
if (!contact) return;
setSaving(true);
await fetch(’/api/contacts’, {
method: ‘PATCH’,
headers: { ‘Content-Type’: ‘application/json’ },
body: JSON.stringify({
id: contact.id,
status,
notes,
call_attempts: (contact.call_attempts ?? 0) + 1,
last_called_at: new Date().toISOString(),
}),
});
setSaving(false);
setSaved(true);
setTimeout(() => { setSaved(false); router.push(’/contacts’); }, 1200);
};

if (loading) return <div className="min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center">Loading…</div>;
if (!contact) return <div className="min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center">Contact not found.</div>;

return (
<div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
<div className="max-w-2xl mx-auto space-y-6">

```
    {/* Header */}
    <div className="flex items-center justify-between">
      <button onClick={() => router.push('/contacts')} className="text-zinc-500 hover:text-zinc-300 text-sm">← Back</button>
      <span className="text-zinc-500 text-xs">Call #{(contact.call_attempts ?? 0) + 1}</span>
    </div>

    {/* Contact Card */}
    <div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800">
      <h1 className="text-xl font-bold mb-1">{contact.full_name}</h1>
      <p className="text-zinc-400 text-sm">{contact.role ?? 'OWNER'} {contact.mailing_address ? `· ${contact.mailing_address}` : ''}</p>
      <div className="mt-3 flex gap-4 text-sm">
        <a href={`tel:${contact.phone_primary}`} className="bg-green-800 hover:bg-green-700 text-green-100 px-4 py-2 rounded font-medium transition-colors">
          📞 Call {contact.phone_primary ?? '—'}
        </a>
        {contact.email && (
          <a href={`mailto:${contact.email}`} className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded text-sm transition-colors">
            ✉ Email
          </a>
        )}
      </div>
      {contact.dnc && (
        <p className="mt-3 text-red-400 text-xs font-medium">⚠️ DO NOT CALL — DNC flag active</p>
      )}
    </div>

    {/* Call Script */}
    <div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800 space-y-4">
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Call Script</h2>

      <div>
        <p className="text-xs text-zinc-500 mb-1">INTRO</p>
        <p className="text-zinc-200 text-sm leading-relaxed">{SCRIPT.intro(contact.full_name.split(' ')[0])}</p>
      </div>
      <div>
        <p className="text-xs text-zinc-500 mb-1">PITCH</p>
        <p className="text-zinc-200 text-sm leading-relaxed">{SCRIPT.motivated}</p>
      </div>
      <div>
        <p className="text-xs text-zinc-500 mb-1">VOICEMAIL</p>
        <p className="text-zinc-300 text-sm leading-relaxed italic">{SCRIPT.voicemail(contact.full_name.split(' ')[0])}</p>
      </div>
      <div>
        <p className="text-xs text-zinc-500 mb-1">OBJECTION — NOT SELLING</p>
        <p className="text-zinc-300 text-sm leading-relaxed">{SCRIPT.objection_not_selling}</p>
      </div>
      <div>
        <p className="text-xs text-zinc-500 mb-1">OBJECTION — NOT INTERESTED</p>
        <p className="text-zinc-300 text-sm leading-relaxed">{SCRIPT.objection_not_interested}</p>
      </div>
    </div>

    {/* Log Outcome */}
    <div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800 space-y-4">
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Log Outcome</h2>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              status === s ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Notes from this call..."
        rows={4}
        className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 resize-none"
      />

      <button
        onClick={handleSave}
        disabled={saving || saved}
        className="w-full bg-zinc-100 text-zinc-900 font-semibold py-2.5 rounded hover:bg-white transition-colors disabled:opacity-50"
      >
        {saved ? '✅ Saved — returning...' : saving ? 'Saving...' : 'Save & Return to Contacts'}
      </button>
    </div>

  </div>
</div>
```

);
}