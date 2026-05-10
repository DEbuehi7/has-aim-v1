“use client”;

export const dynamic = “force-dynamic”;



import { useEffect, useState } from “react”;



const STAGES = [“ALL”, “NEW”, “ANALYZING”, “OFFER”, “UNDER_CONTRACT”, “CLOSED”, “DEAD”];



const STAGE_COLORS = {

NEW: “bg-zinc-700 text-zinc-200”,

ANALYZING: “bg-blue-900 text-blue-200”,

OFFER: “bg-yellow-900 text-yellow-200”,

UNDER_CONTRACT: “bg-purple-900 text-purple-200”,

CLOSED: “bg-green-900 text-green-200”,

DEAD: “bg-red-950 text-red-400”,

};



export default function DealsPage() {

const [deals, setDeals] = useState([]);

const [loading, setLoading] = useState(true);

const [stage, setStage] = useState(“ALL”);

const [search, setSearch] = useState(””);



useEffect(() => {

fetch(”/api/deals”)

.then(r => r.json())

.then(d => { setDeals(Array.isArray(d) ? d : []); setLoading(false); })

.catch(() => setLoading(false));

}, []);



const filtered = deals.filter(d => {

const matchStage = stage === “ALL” || d.stage === stage;

const matchSearch = (d.address ?? “”).toLowerCase().includes(search.toLowerCase()) ||

(d.owner_name ?? “”).toLowerCase().includes(search.toLowerCase());

return matchStage && matchSearch;

});



const totalARV = filtered.reduce((sum, d) => sum + (d.arv ?? 0), 0);

const totalOffer = filtered.reduce((sum, d) => sum + (d.offer_price ?? 0), 0);



return (

<div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">

<div className="max-w-6xl mx-auto">



```

    <div className="flex items-center justify-between mb-6">

      <h1 className="text-2xl font-bold tracking-tight">Deal Pipeline</h1>

      <span className="text-zinc-400 text-sm">{filtered.length} deals</span>

    </div>



    <div className="grid grid-cols-3 gap-4 mb-6">

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">

        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Total ARV</p>

        <p className="text-xl font-bold">${totalARV.toLocaleString()}</p>

      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">

        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Total Offers</p>

        <p className="text-xl font-bold">${totalOffer.toLocaleString()}</p>

      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">

        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Active</p>

        <p className="text-xl font-bold">{deals.filter(d => !["CLOSED","DEAD"].includes(d.stage)).length}</p>

      </div>

    </div>



    <div className="flex gap-3 mb-6 flex-wrap">

      <input

        value={search}

        onChange={e => setSearch(e.target.value)}

        placeholder="Search address or owner..."

        className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm w-64 focus:outline-none focus:border-zinc-500"

      />

      {STAGES.map(s => (

        <button

          key={s}

          onClick={() => setStage(s)}

          className={"px-3 py-2 rounded text-xs font-medium transition-colors " +

            (stage === s ? "bg-zinc-100 text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700")}

        >

          {s}

        </button>

      ))}

    </div>



    {loading ? (

      <p className="text-zinc-500 text-sm">Loading...</p>

    ) : filtered.length === 0 ? (

      <div className="text-center py-20">

        <p className="text-zinc-500 text-sm">No deals found.</p>

        <p className="text-zinc-600 text-xs mt-2">Add deals from the Sentinel lead pipeline.</p>

      </div>

    ) : (

      <div className="overflow-x-auto rounded-lg border border-zinc-800">

        <table className="w-full text-sm">

          <thead className="bg-zinc-900 text-zinc-400 uppercase text-xs tracking-wider">

            <tr>

              <th className="px-4 py-3 text-left">Address</th>

              <th className="px-4 py-3 text-left">Owner</th>

              <th className="px-4 py-3 text-left">Stage</th>

              <th className="px-4 py-3 text-left">ARV</th>

              <th className="px-4 py-3 text-left">Offer</th>

              <th className="px-4 py-3 text-left">Score</th>

              <th className="px-4 py-3 text-left">Zoning</th>

              <th className="px-4 py-3 text-left">Updated</th>

            </tr>

          </thead>

          <tbody className="divide-y divide-zinc-800">

            {filtered.map(d => (

              <tr key={d.id} className="hover:bg-zinc-900 transition-colors">

                <td className="px-4 py-3 font-medium">{d.address ?? "--"}</td>

                <td className="px-4 py-3 text-zinc-400">{d.owner_name ?? "--"}</td>

                <td className="px-4 py-3">

                  <span className={"px-2 py-1 rounded text-xs font-medium " + (STAGE_COLORS[d.stage] ?? "bg-zinc-700 text-zinc-200")}>

                    {d.stage ?? "NEW"}

                  </span>

                </td>

                <td className="px-4 py-3 text-zinc-300">{d.arv ? "$" + d.arv.toLocaleString() : "--"}</td>

                <td className="px-4 py-3 text-zinc-300">{d.offer_price ? "$" + d.offer_price.toLocaleString() : "--"}</td>

                <td className="px-4 py-3">

                  <span className={"font-medium " + (d.lead_score >= 70 ? "text-green-400" : d.lead_score >= 40 ? "text-yellow-400" : "text-red-400")}>

                    {d.lead_score ?? 0}

                  </span>

                </td>

                <td className="px-4 py-3 text-zinc-400">{d.zoning_code ?? "--"}</td>

                <td className="px-4 py-3 text-zinc-500 text-xs">

                  {d.updated_at ? new Date(d.updated_at).toLocaleDateString() : "--"}

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
