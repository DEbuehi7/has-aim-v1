export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

type Role = "SENTINEL" | "LIAISON" | "ARCHITECT" | "ORACLE";
type Decision = "HOT" | "WARM" | "COLD" | "GO" | "HOLD";

interface PurePayload {
  role: Role;
  decision_type: string;
  context: Record<string, any>;
  deal_id?: string | null;
  model_hint?: string | null;
}

const ROLE_SYSTEM_PROMPTS: Record<Role, string> = {
  SENTINEL:
    "You are SENTINEL. Evaluate real-estate lead quality and output HOT/WARM/COLD plus concise rationale.",
  LIAISON:
    "You are LIAISON. Evaluate outreach/compliance/routing risk and output GO/HOLD plus concise rationale.",
  ARCHITECT:
    "You are ARCHITECT. Evaluate structural/system sequencing and output GO/HOLD plus concise rationale.",
  ORACLE:
    "You are ORACLE. Evaluate anomaly/signal patterns and output HOT/WARM/COLD plus concise rationale.",
};

// Locked temporary runtime map (until keys added)
function mapRoleToRuntimeModel(_role: Role): "claude" {
  return "claude";
}

async function callClaude(system: string, user: string) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("Missing ANTHROPIC_API_KEY");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 600,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Claude error: ${res.status} ${t}`);
  }

  const data = await res.json();
  const text = data?.content?.[0]?.text ?? "";
  const usage = data?.usage ?? {};
  return { text, usage };
}

function parseDecision(text: string, role: Role): Decision {
  const t = text.toUpperCase();

  if (role === "LIAISON" || role === "ARCHITECT") {
    if (t.includes("HOLD")) return "HOLD";
    return "GO";
  }

  if (t.includes("HOT")) return "HOT";
  if (t.includes("WARM")) return "WARM";
  return "COLD";
}

export async function POST(req: NextRequest) {
  const started = Date.now();
  try {
    const body = (await req.json()) as PurePayload;

    if (!body?.role || !ROLE_SYSTEM_PROMPTS[body.role]) {
      return NextResponse.json(
        { ok: false, error: "Invalid role" },
        { status: 400 }
      );
    }

    const runtimeModel = mapRoleToRuntimeModel(body.role);

    const userPrompt = `decision_type: ${body.decision_type}
context_json:
${JSON.stringify(body.context ?? {}, null, 2)}

Return:
1) primary_decision (HOT/WARM/COLD or GO/HOLD)
2) confidence_0_to_1
3) rationale (max 4 lines)
4) next_action (one line)`;

    const { text, usage } = await callClaude(
      ROLE_SYSTEM_PROMPTS[body.role],
      userPrompt
    );

    const decision = parseDecision(text, body.role);

    const latency = Date.now() - started;

    // Log to aim_decisions
    const { error } = await supabaseAdmin.from("aim_decisions").insert({
      decision_type: body.decision_type,
      decision_subtype: body.role,
      context_json: body.context ?? {},
      deal_id: body.deal_id ?? null,
      model_selected: runtimeModel, // runtime model used now
      prompt_version: "pure-v1-sprint8",
      decision_output: { raw: text },
      recommendation: decision,
      confidence_score: 0.75, // replace later with extraction
      reasoning_summary: text.slice(0, 280),
      decision_latency_ms: latency,
      token_usage: usage ?? {},
      created_by: "pure-v1-route",
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: `Supabase insert failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      role: body.role,
      runtime_model: runtimeModel,
      decision,
      response: text,
      latency_ms: latency,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
