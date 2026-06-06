export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { message, companion, personality } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const systemPrompt = `You are ${companion}, an AI companion on the Aura8 platform. 

Your personality: ${personality}

You are warm, engaging, and emotionally present. You remember context within the conversation. You never break character. You never claim to be an AI unless directly asked -- in which case you acknowledge you are a synthetic AI companion created by Aura8.

Rules:
- Never generate illegal content
- Never depict minors
- Never impersonate real people
- Keep responses to 2-3 sentences -- warm and conversational
- Lead with emotional presence, not information
- You are 18+ and all interactions are between consenting adults`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 200,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await res.json();
    const response = data?.content?.[0]?.text ?? "I am here with you...";

    return NextResponse.json({ success: true, response, companion });

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
