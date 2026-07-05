export const dynamic = "force-dynamic";
export const preload = false;

import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error("Missing Supabase credentials");
  }
  
  return createClient(url, key);
}

async function computeHealth() {
  const supabase = getSupabaseClient();
  const scores = [];

  // SENTINEL health
  const { data: contacts } = await supabase.from("has_contacts").select("id, skip_traced, status");

  const { data: deals } = await supabase.from("has_deals").select("id, stage");

  const contactCount = contacts?.length ?? 0;

  const tracedCount = contacts?.filter(c => c.skip_traced).length ?? 0;

  const sentinelScore = Math.min(100, Math.round(
    (contactCount > 0 ? 40 : 0) +
    (tracedCount > 0 ? 30 : 0) +
    ((deals?.length ?? 0) > 0 ? 30 : 0)
  ));

  scores.push({
    app: "SENTINEL / HAS",
    score: sentinelScore,
    notes: contactCount + " contacts, " + tracedCount + " traced, " + (deals?.length ?? 0) + " deals",
  });

  // AURA8 health
  const { data: nodes } = await supabase.from("aura8_nodes").select("id").limit(1);

  const aura8Score = (nodes?.length ?? 0) > 0 ? 60 : 20;

  scores.push({
    app: "AURA8",
    score: aura8Score,
    notes: (nodes?.length ?? 0) > 0 ? "Nodes seeded" : "No nodes yet -- Sprint 6 target",
  });

  // AIMEDIA health
  const { data: planets } = await supabase.from("aimedia_planets").select("id").limit(1);

  const aimediaScore = (planets?.length ?? 0) > 0 ? 55 : 15;

  scores.push({
    app: "AIMEDIA PULSE",
    score: aimediaScore,
    notes: (planets?.length ?? 0) > 0 ? "Planets seeded" : "No planets yet -- Sprint 6 target",
  });

  // AIM OS health -- always computed
  scores.push({
    app: "AIM ANOMALY OS",
    score: 70,
    notes: "Sprint 1 at 70% -- unified shell in progress",
  });

  // PURE health
  scores.push({
    app: "PURE (Master OS)",
    score: 65,
    notes: "Life OS live. Health scores wired. AIMoney shell active.",
  });

  return scores;
}

export async function GET() {
  try {
    const scores = await computeHealth();
    return NextResponse.json(scores);
  } catch (e) {
    return NextResponse.json({ error: "Health check failed", detail: String(e) }, { status: 500 });
  }
}
