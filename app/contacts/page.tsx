“use client”;

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



```

    <div className="flex gap-3 mb-6 flex-wrap">

      <input

        value={search}

        onChange={e => setSearch(e.target.value)}

        placeholder="Search name or phone..."

        className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm w-64 focus:outline-none focus:border-zinc-500"

      />

      {["ALL","NEW","CALLED","VOICEMAIL","CALLBACK","INTERESTED","NOT_INTERESTED","DNC"].map(s => (

        <button

          key={s}

          onClick={() => setFilter(s)}

          className={`px-3 py-2 rounded text-xs font-medium transition-colors ${

            filter === s ? "bg-zinc-100 text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"

          }`}

        >

          {s}

        </button>

      ))}

    </div>



    {loading ? (

      <p className="text-zinc-500 text-sm">Loading...</p>

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

                <td className="px-4 py-3 text-zinc-300">{c.phone_primary ?? "--"}</td>

                <td className="px-4 py-3 text-zinc-400">{c.email ?? "--"}</td>

                <td className="px-4 py-3 text-zinc-400 capitalize">{(c.role ?? "--").toLowerCase()}</td>

                <td className="px-4 py-3">

                  <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[c.status] ?? "bg-zinc-700 text-zinc-200"}`}>

                    {c.status ?? "NEW"}

                  </span>

                </td>

                <td className="px-4 py-3 text-zinc-400">{c.call_attempts ?? 0}</td>

                <td className="px-4 py-3 space-x-1">

                  {c.dnc && <span className="bg-red-950 text-red-400 px-1.5 py-0.5 rounded text-xs">DNC</span>}

                  {!c.skip_traced && <span className="bg-yellow-950 text-yellow-400 px-1.5 py-0.5 rounded text-xs">NOT TRACED</span>}

                </td>

                <td className="px-4 py-3">

                  <Link

                    href={`/contacts/${c.id}`}

                    className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded text-xs transition-colors"

                  >

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

```



);

}
