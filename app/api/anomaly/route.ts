export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { buildSystemPrompt, validateOutput } from "@/lib/pure-filter";

const PERSONAS = {
  claude: {
    name: "Sentinel",
    role: "Structural Common Sense",
    color: "#00E5FF",
  },
};

export async function POST(req) {
  try {
    const { message, vertical, mode } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const persona = PERSONAS.claude;

    const systemPrompt = buildSystemPrompt({
      vertical,
      mode,
      extraContext: "Active platform: AIM Anomaly OS. You are the Sentinel -- structural common sense and legal defensibility AI for Daniel Ebuehi.",
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();
    const content = data?.content;
    const rawText = Array.isArray(content) && content.length > 0
      ? content[0].text
      : (data?.error?.message ?? "No response from Sentinel.");

    const text = validateOutput(rawText);

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
}        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();
    const content = data?.content;
    const text = Array.isArray(content) && content.length > 0 ? content[0].text : (data?.error?.message ?? "No response from Sentinel.");


    console.log("FULL RESPONSE:", JSON.stringify(data));
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
