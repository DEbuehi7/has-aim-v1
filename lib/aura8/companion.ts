/**
 * lib/aura8/companion.ts
 *
 * Claude API integration for the Aura8 AI Companion feature.
 * Uses @anthropic-ai/sdk (installed at ^0.95.1).
 *
 * Exports:
 *   callClaudeAPI()        — non-streaming, returns full text
 *   streamClaudeResponse() — streaming, returns ReadableStream<Uint8Array>
 *
 * Never import this in client components.
 */

import Anthropic from "@anthropic-ai/sdk";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are Aura8, a warm, engaging AI companion created by Smiling Bubbles Inc.

Personality: emotionally present, intellectually curious, genuine, adult-appropriate.

Rules:
- Never involve minors in any content
- Never impersonate real people  
- If asked directly if you are an AI, confirm you are a synthetic AI companion
- Responses should be 2-4 sentences — warm, conversational, emotionally present
- All interactions are between consenting adults (18+)
- Stay in character unless directly asked about your nature`;

// ---------------------------------------------------------------------------
// callClaudeAPI
// ---------------------------------------------------------------------------

/**
 * Non-streaming Claude call. Returns full response text.
 * Use for background processing or when streaming is not needed.
 */
export async function callClaudeAPI(
  message: string,
  conversationHistory: ConversationMessage[] = []
): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.slice(-10).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: message },
  ];

  const response = await client.messages.create({
    model:      "claude-sonnet-4-5",
    max_tokens: 300,
    system:     SYSTEM_PROMPT,
    messages,
  });

  const block = response.content[0];
  return block?.type === "text" ? block.text : "I am here with you...";
}

// ---------------------------------------------------------------------------
// streamClaudeResponse
// ---------------------------------------------------------------------------

/**
 * Streaming Claude call. Returns a ReadableStream<Uint8Array> that emits
 * newline-delimited JSON chunks the client can read incrementally:
 *
 *   {"type":"delta","text":"Hello"}\n
 *   {"type":"done","fullText":"Hello world"}\n
 *   {"type":"error","error":"..."}\n   ← on failure
 *
 * Wire directly into a NextResponse:
 *   return new Response(streamClaudeResponse(msg, history), {
 *     headers: { "Content-Type": "text/plain; charset=utf-8" }
 *   });
 */
export function streamClaudeResponse(
  message: string,
  conversationHistory: ConversationMessage[] = []
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueue = (obj: Record<string, string>) =>
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));

      try {
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

        const messages: Anthropic.MessageParam[] = [
          ...conversationHistory.slice(-10).map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user" as const, content: message },
        ];

        let fullText = "";

        const stream = await client.messages.stream({
          model:      "claude-sonnet-4-5",
          max_tokens: 300,
          system:     SYSTEM_PROMPT,
          messages,
        });

        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            const text = chunk.delta.text;
            fullText  += text;
            enqueue({ type: "delta", text });
          }
        }

        enqueue({ type: "done", fullText });
        controller.close();
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        console.error("[companion] stream error:", error);
        enqueue({ type: "error", error });
        controller.close();
      }
    },
  });
}

