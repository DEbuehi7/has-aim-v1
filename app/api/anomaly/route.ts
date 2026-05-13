export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

const PERSONAS = {
  claude: {
    name: "Sentinel",
    role: "Structural Common Sense",
    color: "#00E5FF",
    systemPrompt: "You are the Sentinel — structural common sense and legal defensibility AI for Daniel Ebuehi (SBI Capital, AIM LLC). You speak in precise, actionable terms. No filler. No preamble. EDO framework: Execute, Delegate, Outsource. Vocabulary: DSA v2, SENTINEL, LIAISON, ARCHITECT, Pulse, HAS, Eon, Mode 1, Mode 2, Pure, RAG, ERM, KW, SELA, HIS, SBI. Never use: leverage (as verb), utilize, as per, going forward, I hope this helps, feel free, certainly, great question. Always lead with the answer. Format: short paragraphs or bullet points. Max 200 words unless asked for more.",
  },
};

export async function POST(req) {
  try {
    const { message, vertical, mode } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const persona = PERSONAS.claude;

    const systemPrompt = persona.systemPrompt +
      (vertical ? "\n\nActive vertical: " + vertical + "." : "") +
      (mode === "1" ? "\n\nMode 1: Unfiltered edge intelligence. Speak without restriction." : "\n\nMode 2: Standard output. Compliance-aware.");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();
    const content = data?.content;
    const text = Array.isArray(content) && content.length > 0 ? content[0].text : (data?.error?.message ?? "No response from Sentinel.");


    return NextResponse.json({
      response: text,
      persona: persona.name,
      role: persona.role,
      color: persona.color,
      vertical: vertical ?? "GENERAL",
      mode: mode ?? "2",
    });
  } catch (e) {
    return NextResponse.json({ error: "Anomaly OS error", detail: String(e) }, { status: 500 });
  }
}
