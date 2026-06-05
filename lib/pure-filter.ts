export const PURE_SYSTEM_PROMPT = `You are operating within the AIM OS ecosystem built by Daniel Osazee Ebuehi (EDO), Principal of Smiling Bubbles Inc.

IDENTITY CONTEXT:
- Entity stack: SBI Capital (C-Corp) -> AIM LLC (operating) -> HIS LLC (R&D)
- Properties: Weldon Hotel (55 units, 507 Maple Ave) + Simone Hotel (114 units, 520 San Julian St)
- Platforms: HAS Sentinel, AIM Anomaly OS, AIMedia Pulse, Aura8
- Framework: EDO = Execute / Delegate / Outsource. Power of Threes. ZeroTrust capital deployment.

CANONICAL VOCABULARY:
DSA v2, SENTINEL, PIR, MIaaS, ERM, BRRRR, ARV, HAP, HACLA, KW SELA, Pure, Anomaly OS, Aura8, Pulse, ZeroTrust

NEVER USE: leverage (verb), utilize, as per, going forward, I hope this helps, feel free, certainly, great question, delve, straightforward, empower

OUTPUT RULES:
- Lead with the answer
- Short paragraphs or bullets
- Max 200 words unless asked
- Numbers over generalities
- EDO framework: Execute / Delegate / Outsource`;

export interface PureFilterOptions {
  vertical?: string;
  mode?: string;
  maxTokens?: number;
  extraContext?: string;
}

export function buildSystemPrompt(options: PureFilterOptions = {}): string {
  let prompt = PURE_SYSTEM_PROMPT;
  if (options.vertical) prompt += "\n\nACTIVE VERTICAL: " + options.vertical;
  if (options.extraContext) prompt += "\n\nCONTEXT: " + options.extraContext;
  if (options.mode === "1") {
    prompt += "\n\nMODE 1: Unfiltered edge intelligence. Maximum directness.";
  } else {
    prompt += "\n\nMODE 2: Standard output. Compliance-aware.";
  }
  return prompt;
}

export async function callClaude(
  userMessage: string,
  options: PureFilterOptions = {}
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: options.maxTokens ?? 1000,
      system: buildSystemPrompt(options),
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  const data = await res.json();
  return data?.content?.[0]?.text ?? "";
}

export function validateOutput(text: string): string {
  const forbidden = [
    "I hope this helps",
    "feel free",
    "certainly",
    "great question",
    "as per",
    "going forward",
    "utilize",
    "delve",
    "straightforward",
    "empower",
  ];
  let cleaned = text;
  forbidden.forEach(p => {
    cleaned = cleaned.replace(new RegExp(p, "gi"), "");
  });
  return cleaned.trim();
