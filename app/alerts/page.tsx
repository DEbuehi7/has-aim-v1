"use client";

export const dynamic = "force-dynamic";



import { useEffect, useState } from "react";



const ALERT_TYPES = ["ALL", "HAP_SUBMISSION", "ABATEMENT", "TAX", "INSPECTION", "GENERAL"];



const ALERT_COLORS = {

TAX_DELINQUENT: "bg-red-900 text-red-200",

CODE_VIOLATION: "bg-orange-900 text-orange-200",

ABSENTEE_OWNER: "bg-yellow-900 text-yellow-200",

HIGH_SCORE: "bg-green-900 text-green-200",

PRICE_DROP: "bg-blue-900 text-blue-200",

};



const ALERT_ICONS = {

TAX_DELINQUENT: "T",

CODE_VIOLATION: "C",

ABSENTEE_OWNER: "A",

HIGH_SCORE: "H",

PRICE_DROP: "P",

};



export default function AlertsPage() {

const [alerts, setAlerts] = useState([]);

const [properties, setProperties] = useState([]);

const [loading, setLoading] = useState(true);

const [filter, setFilter] = useState("ALL");



useEffect(() => {

fetch("/api/alerts")

.then(r => r.json())

.then(d => { setAlerts(Array.isArray(d) ? d : []); setLoading(false); })

.catch(() => {

setAlerts([]);

setLoading(false);

});

}, []);



const filtered = alerts.filter(a => filter === "ALL" || a.alert_type === filter);

const unread = alerts.filter(a => !a.read).length;



const markRead = async (id) => {

setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));

await fetch("/api/alerts", {

method: "PATCH",

headers: { "Content-Type": "application/json" },

body: JSON.stringify({ id, read: true }),

});

};



const markAllRead = async () => {

setAlerts(prev => prev.map(a => ({ ...a, read: true })));

await fetch("/api/alerts", {

method: "PATCH",

headers: { "Content-Type": "application/json" },

body: JSON.stringify({ markAllRead: true }),

});

};



return (

<div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">

<div className="max-w-4xl mx-auto">




    <div className="flex items-center justify-between mb-6">

      <div className="flex items-center gap-3">

        <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>

        {unread > 0 && (

          <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">

            {unread}

          </span>

        )}

      </div>

      {unread > 0 && (

        <button

          onClick={markAllRead}

          className="text-zinc-400 hover:text-zinc-200 text-xs transition-colors"

        >

          Mark all read

        </button>

      )}

    </div>



    <div className="flex gap-3 mb-6 flex-wrap">

      {ALERT_TYPES.map(t => (

        <button

          key={t}

          onClick={() => setFilter(t)}

          className={"px-3 py-2 rounded text-xs font-medium transition-colors " +

            (filter === t ? "bg-zinc-100 text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700")}

        >

          {t.replace(/_/g, " ")}

        </button>

      ))}

    </div>



    {loading ? (

      <p className="text-zinc-500 text-sm">Loading...</p>

    ) : filtered.length === 0 ? (

      <div className="text-center py-20">

        <p className="text-zinc-500 text-sm">No alerts.</p>

        <p className="text-zinc-600 text-xs mt-2">Alerts are generated automatically by the Sentinel pipeline.</p>

      </div>

    ) : (

      <div className="space-y-3">

        {filtered.map(a => (

          <div

            key={a.id}

            className={"rounded-lg border p-4 transition-colors " +

              (a.read ? "bg-zinc-900 border-zinc-800" : "bg-zinc-900 border-zinc-700")}

          >

            <div className="flex items-start justify-between gap-4">

              <div className="flex items-start gap-3">

                <span className={"w-8 h-8 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 " +

                  (ALERT_COLORS[a.alert_type] ?? "bg-zinc-700 text-zinc-200")}>

                  {ALERT_ICONS[a.alert_type] ?? "!"}

                </span>

                <div>

                  <div className="flex items-center gap-2 mb-1">

                    <span className={"text-xs font-medium px-2 py-0.5 rounded " +

                      (ALERT_COLORS[a.alert_type] ?? "bg-zinc-700 text-zinc-200")}>

                      {(a.alert_type ?? "ALERT").replace(/_/g, " ")}

                    </span>

                    {!a.read && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}

                  </div>

                  <p className="text-zinc-200 text-sm font-medium">{a.address ?? "Unknown address"}</p>

                  <p className="text-zinc-400 text-xs mt-0.5">{a.message ?? "--"}</p>

                  {a.lead_score && (

                    <p className={"text-xs mt-1 font-medium " +

                      (a.lead_score >= 70 ? "text-green-400" : a.lead_score >= 40 ? "text-yellow-400" : "text-red-400")}>

                      Lead score: {a.lead_score}

                    </p>

                  )}

                </div>

              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">

                <p className="text-zinc-600 text-xs">

                  {a.created_at ? new Date(a.created_at).toLocaleDateString() : "--"}

                </p>

                {!a.read && (

                  <button

                    onClick={() => markRead(a.id)}

                    className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"

                  >

                    Dismiss

                  </button>

                )}

              </div>

            </div>

          </div>

        ))}

      </div>

    )}

  </div>

</div>




);

}
