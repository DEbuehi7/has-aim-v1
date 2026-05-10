import os



files = {}



files[“app/api/contacts/route.ts”] = ‘’’export const dynamic = “force-dynamic”;

import { NextResponse } from “next/server”;

import { createClient } from “@supabase/supabase-js”;



const supabase = createClient(

process.env.NEXT_PUBLIC_SUPABASE_URL,

process.env.SUPABASE_SERVICE_ROLE_KEY

);



export async function GET() {

try {

const { data, error } = await supabase

.from(“has_contacts”)

.select(”*”)

.order(“created_at”, { ascending: false });

if (error) throw error;

return NextResponse.json(data);

} catch (e) {

return NextResponse.json({ error: “Failed to fetch contacts” }, { status: 500 });

}

}



export async function POST(req) {

try {

const body = await req.json();

const { data, error } = await supabase

.from(“has_contacts”)

.insert([body])

.select()

.single();

if (error) throw error;

return NextResponse.json(data);

} catch (e) {

return NextResponse.json({ error: “Failed to create contact” }, { status: 500 });

}

}



export async function PATCH(req) {

try {

const body = await req.json();

const { id, …updates } = body;

const { data, error } = await supabase

.from(“has_contacts”)

.update({ …updates, updated_at: new Date().toISOString() })

.eq(“id”, id)

.select()

.single();

if (error) throw error;

return NextResponse.json(data);

} catch (e) {

return NextResponse.json({ error: “Failed to update contact” }, { status: 500 });

}

}

‘’’



files[“app/contacts/page.tsx”] = ‘’’“use client”;

export const dynamic = “force-dynamic”;



import { useEffect, useState } from “react”;

import Link from “next/link”;



const STATUS_COLORS = {

NEW: “bg-zinc-700 text-zinc-200”,

CALLED: “bg-blue-900 text-blue-200”,

VOICEMAIL: “bg-yellow-900 text-yellow-200”,

CALLBACK: “bg-purple-900 text-purple-200”,

INTERESTED: “bg-green-900 text-green-200”,

NOT_INTERESTED: “bg-red-900 text-red-200”,

DNC: “bg-red-950 text-red-400”,

};



export default function ContactsPage() {

const [contacts, setContacts] = useState([]);

const [loading, setLoading] = useState(true);

const [search, setSearch] = useState(””);

const [filter, setFilter] = useState(“ALL”);



useEffect(() => {

fetch(”/api/contacts”)

.then(r => r.json())

.then(d => { setContacts(d); setLoading(false); })

.catch(() => setLoading(false));

}, []);



const filtered = contacts.filter(c => {

const matchSearch =

c.full_name.toLowerCase().includes(search.toLowerCase()) ||

(c.phone_primary ?? “”).includes(search);

const matchFilter = filter === “ALL” || c.status === filter;

return matchSearch && matchFilter;

});



return (

<div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">

<div className="max-w-6xl mx-auto">

<div className="flex items-center justify-between mb-6">

<h1 className="text-2xl font-bold tracking-tight">Contacts</h1>

<span className="text-zinc-400 text-sm">{filtered.length} records</span>

</div>

<div className="flex gap-3 mb-6 flex-wrap">

<input

value={search}

onChange={e => setSearch(e.target.value)}

placeholder=“Search name or phone…”

className=“bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm w-64 focus:outline-none focus:border-zinc-500”

/>

{[“ALL”,“NEW”,“CALLED”,“VOICEMAIL”,“CALLBACK”,“INTERESTED”,“NOT_INTERESTED”,“DNC”].map(s => (

<button

key={s}

onClick={() => setFilter(s)}

className={“px-3 py-2 rounded text-xs font-medium transition-colors “ +

(filter === s ? “bg-zinc-100 text-zinc-900” : “bg-zinc-800 text-zinc-400 hover:bg-zinc-700”)}

>

{s}

</button>

))}

</div>

{loading ? (

<p className="text-zinc-500 text-sm">Loading…</p>

) : filtered.length === 0 ? (

<p className="text-zinc-500 text-sm">No contacts found.</p>

) : (

<div className="overflow-x-auto rounded-lg border border-zinc-800">

<table className="w-full text-sm">

<thead className="bg-zinc-900 text-zinc-400 uppercase text-xs tracking-wider">

<tr>

<th className="px-4 py-3 text-left">Name</th>

<th className="px-4 py-3 text-left">Phone</th>

<th className="px-4 py-3 text-left">Email</th>

<th className="px-4 py-3 text-left">Role</th>

<th className="px-4 py-3 text-left">Status</th>

<th className="px-4 py-3 text-left">Calls</th>

<th className="px-4 py-3 text-left">Flags</th>

<th className="px-4 py-3 text-left">Action</th>

</tr>

</thead>

<tbody className="divide-y divide-zinc-800">

{filtered.map(c => (

<tr key={c.id} className="hover:bg-zinc-900 transition-colors">

<td className="px-4 py-3 font-medium">{c.full_name}</td>

<td className="px-4 py-3 text-zinc-300">{c.phone_primary ?? “–”}</td>

<td className="px-4 py-3 text-zinc-400">{c.email ?? “–”}</td>

<td className="px-4 py-3 text-zinc-400 capitalize">{(c.role ?? “–”).toLowerCase()}</td>

<td className="px-4 py-3">

<span className={“px-2 py-1 rounded text-xs font-medium “ + (STATUS_COLORS[c.status] ?? “bg-zinc-700 text-zinc-200”)}>

{c.status ?? “NEW”}

</span>

</td>

<td className="px-4 py-3 text-zinc-400">{c.call_attempts ?? 0}</td>

<td className="px-4 py-3 space-x-1">

{c.dnc && <span className="bg-red-950 text-red-400 px-1.5 py-0.5 rounded text-xs">DNC</span>}

{!c.skip_traced && <span className="bg-yellow-950 text-yellow-400 px-1.5 py-0.5 rounded text-xs">NOT TRACED</span>}

</td>

<td className="px-4 py-3">

<Link href={”/contacts/” + c.id} className=“bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded text-xs transition-colors”>

Call Script

</Link>

</td>

</tr>

))}

</tbody>

</table>

</div>

)}

</div>

</div>

);

}

‘’’



files[“app/contacts/[id]/page.tsx”] = ‘’’“use client”;



import { useEffect, useState } from “react”;

import { useParams, useRouter } from “next/navigation”;



const STATUSES = [“NEW”,“CALLED”,“VOICEMAIL”,“CALLBACK”,“INTERESTED”,“NOT_INTERESTED”,“DNC”];



const SCRIPT = {

intro: function(name) {

return “Hi, may I speak with “ + name + “? My name is Daniel with AIM Capital. I am reaching out because we work with property owners in your area and I wanted to have a quick conversation about your property.”;

},

pitch: “We have been helping owners in similar situations explore their options, whether that is selling, refinancing, or just understanding what the property is worth today. Would you be open to a 5-minute conversation?”,

voicemail: function(name) {

return “Hi “ + name + “, this is Daniel with AIM Capital. I am reaching out about your property and wanted to connect. Please call me back at 323-689-4495. Thank you.”;

},

objection_not_selling: “Totally understand. I am not here to pressure you at all. We work with a lot of owners who are not actively looking to sell but find it valuable to know their options. Would it be okay if I followed up in a few months?”,

objection_not_interested: “No problem at all. I appreciate your time. Have a great day.”,

};



export default function CallScriptPage() {

const { id } = useParams();

const router = useRouter();

const [contact, setContact] = useState(null);

const [loading, setLoading] = useState(true);

const [notes, setNotes] = useState(””);

const [status, setStatus] = useState(“NEW”);

const [saving, setSaving] = useState(false);

const [saved, setSaved] = useState(false);



useEffect(() => {

fetch(”/api/contacts”)

.then(r => r.json())

.then(function(data) {

const c = data.find(function(x) { return x.id === Number(id); });

if (c) { setContact(c); setNotes(c.notes ?? “”); setStatus(c.status ?? “NEW”); }

setLoading(false);

})

.catch(function() { setLoading(false); });

}, [id]);



const handleSave = async function() {

if (!contact) return;

setSaving(true);

await fetch(”/api/contacts”, {

method: “PATCH”,

headers: { “Content-Type”: “application/json” },

body: JSON.stringify({

id: contact.id,

status: status,

notes: notes,

call_attempts: (contact.call_attempts ?? 0) + 1,

last_called_at: new Date().toISOString(),

}),

});

setSaving(false);

setSaved(true);

setTimeout(function() { setSaved(false); router.push(”/contacts”); }, 1200);

};



if (loading) return React.createElement(“div”, { className: “min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center” }, “Loading…”);

if (!contact) return React.createElement(“div”, { className: “min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center” }, “Contact not found.”);



const firstName = contact.full_name.split(” “)[0];



return (

<div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">

<div className="max-w-2xl mx-auto space-y-6">

<div className="flex items-center justify-between">

<button onClick={function() { router.push(”/contacts”); }} className=“text-zinc-500 hover:text-zinc-300 text-sm”>Back to Contacts</button>

<span className="text-zinc-500 text-xs">Call #{(contact.call_attempts ?? 0) + 1}</span>

</div>

<div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800">

<h1 className="text-xl font-bold mb-1">{contact.full_name}</h1>

<p className="text-zinc-400 text-sm">{contact.role ?? “OWNER”}{contact.mailing_address ? “ - “ + contact.mailing_address : “”}</p>

<div className="mt-3 flex gap-3 flex-wrap">

<a href={“tel:” + contact.phone_primary} className=“bg-green-800 hover:bg-green-700 text-green-100 px-4 py-2 rounded font-medium text-sm transition-colors”>

{“Call “ + (contact.phone_primary ?? “–”)}

</a>

{contact.email && (

<a href={“mailto:” + contact.email} className=“bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded text-sm transition-colors”>Email</a>

)}

</div>

{contact.dnc && <p className="mt-3 text-red-400 text-xs font-medium">WARNING: DO NOT CALL - DNC flag active</p>}

</div>

<div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800 space-y-4">

<h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Call Script</h2>

{[

[“INTRO”, SCRIPT.intro(firstName)],

[“PITCH”, SCRIPT.pitch],

[“VOICEMAIL”, SCRIPT.voicemail(firstName)],

[“OBJECTION - NOT SELLING”, SCRIPT.objection_not_selling],

[“OBJECTION - NOT INTERESTED”, SCRIPT.objection_not_interested],

].map(function(item) {

return (

<div key={item[0]}>

<p className="text-xs text-zinc-500 mb-1">{item[0]}</p>

<p className="text-zinc-200 text-sm leading-relaxed">{item[1]}</p>

</div>

);

})}

</div>

<div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800 space-y-4">

<h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Log Outcome</h2>

<div className="flex flex-wrap gap-2">

{STATUSES.map(function(s) {

return (

<button

key={s}

onClick={function() { setStatus(s); }}

className={“px-3 py-1.5 rounded text-xs font-medium transition-colors “ + (status === s ? “bg-zinc-100 text-zinc-900” : “bg-zinc-800 text-zinc-400 hover:bg-zinc-700”)}

>

{s}

</button>

);

})}

</div>

<textarea

value={notes}

onChange={function(e) { setNotes(e.target.value); }}

placeholder=“Notes from this call…”

rows={4}

className=“w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 resize-none”

/>

<button

onClick={handleSave}

disabled={saving || saved}

className=“w-full bg-zinc-100 text-zinc-900 font-semibold py-2.5 rounded hover:bg-white transition-colors disabled:opacity-50”

>

{saved ? “Saved - returning…” : saving ? “Saving…” : “Save and Return to Contacts”}

</button>

</div>

</div>

</div>

);

}

‘’’



files[“app/api/batchdata/route.ts”] = ‘’’export const dynamic = “force-dynamic”;

import { NextResponse } from “next/server”;

import { createClient } from “@supabase/supabase-js”;



const supabase = createClient(

process.env.NEXT_PUBLIC_SUPABASE_URL,

process.env.SUPABASE_SERVICE_ROLE_KEY

);



export async function POST(req) {

try {

const { contact_id, address } = await req.json();

if (!contact_id || !address) {

return NextResponse.json({ error: “contact_id and address required” }, { status: 400 });

}

const bdRes = await fetch(“https://api.batchdata.com/api/v1/property/skip-trace”, {

method: “POST”,

headers: {

“Content-Type”: “application/json”,

“Authorization”: “Bearer “ + process.env.BATCHDATA_API_KEY,

},

body: JSON.stringify({ requests: [{ address }] }),

});

const bdData = await bdRes.json();

if (!bdRes.ok) {

return NextResponse.json({ error: “BatchData error”, detail: bdData }, { status: 502 });

}

const result = bdData?.results?.[0];

const phones = result?.phones ?? [];

const emails = result?.emails ?? [];

const owner = result?.owner ?? {};

const updates = {

skip_traced: true,

batchdata_id: result?.id ?? null,

phone_primary: phones[0]?.number ?? null,

phone_secondary: phones[1]?.number ?? null,

email: emails[0]?.address ?? null,

full_name: owner?.fullName ?? null,

mailing_address: owner?.mailingAddress ?? null,

phone_verified: phones[0]?.verified ?? false,

dnc: phones[0]?.dnc ?? false,

tcpa_compliant: phones[0]?.tcpa ?? true,

updated_at: new Date().toISOString(),

};

const { data, error } = await supabase

.from(“has_contacts”)

.update(updates)

.eq(“id”, contact_id)

.select()

.single();

if (error) throw error;

return NextResponse.json({ success: true, contact: data, raw: result });

} catch (e) {

return NextResponse.json({ error: “Skip trace failed”, detail: String(e) }, { status: 500 });

}

}

‘’’



# Write all files



for path, content in files.items():

os.makedirs(os.path.dirname(path), exist_ok=True)

with open(path, “w”, encoding=“utf-8”) as f:

f.write(content)

print(“Written: “ + path)



print(“All files written successfully.”)
