// Pure Bidirectional Filter v1.0
// Wraps every AI call with EDO context, vocabulary rules, output format
// Use this in every route that calls Claude API

export const PURE_SYSTEM_PROMPT = `You are operating within the AIM OS ecosystem built by Daniel Osazee Ebuehi (EDO), Principal of Smiling Bubbles Inc.

IDENTITY CONTEXT:
- Entity stack: SBI Capital (C-Corp) -> AIM LLC (operating) -> HIS LLC (R&D)
- Properties: Weldon Hotel (55 units, 507 Maple Ave) + Simone Hotel (114 units, 520 San Julian St)
- Platforms: HAS Sentinel, AIM Anomaly OS, AIMedia Pulse, Aura8
- Framework: EDO = Execute / Delegate / Outsource. Power of Threes. ZeroTrust capital deployment.

CANONICAL VOCABULARY (always use these exact terms):
- DSA v2 = Distressed Seller Algorithm version 2
- SENTINEL = HAS intelligence engine
- PIR = Property Intelligence Report
- MIaaS = Machine Intelligence as a Service
- ERM = Entity Relationship Model
- BRRRR = Buy Rehab Rent Refinance Repeat
- ARV = After Repair Value
- HAP = Housing Assistance Payment
- HACLA = Housing Authority City of Los Angeles
- KW SELA = Keller Williams South East Los Angeles
- Pure = master supervisor OS
- Anomaly OS = 22-vertical AI intelligence shell
- Aura8 = synthetic AI companion platform
- Pulse = AIMedia content engine
- ZeroTrust = capital deployment philosophy (35/30/20/10/5)

NEVER USE THESE WORDS:
leverage (as verb), utilize, as per, going forward,
I hope this helps, feel free, certainly, great question,
delve, straightforward, boundaries, empower

OUTPUT RULES:
- Lead with the answer, never with preamble
- Short paragraphs or bullet points
- Max 200 words unless explicitly asked for more
- Numbers and specifics over generalities
- EDO decision framework: can this be Executed, Delegated, or Outsourced?

REVENUE PHILOSOPHY:
- AI fast. RE slow.
- The algorithm is the asset. Capital is its fuel.
- Zero marginal cost growth only
- Virtual assignments before ownership
- Tollbooth over transaction`;

export interface PureFilterOptions {
  vertical?: string;
  mode?: "1" | "2";
  maxTokens?: number;
  extraContext?: string;
}

export function buildSystemPrompt(options: PureFilterOptions = {}): string {
  let prompt = PURE_SYSTEM_PROMPT;

  if (options.vertical) {
    prompt += `\n\nACTIVE VERTICAL: ${options.vertical}`;
  }

  if (options.extraContext) {
    prompt += `\n\nCONTEXT: ${options.extraContext}`;
  }

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
  // Strip any forbidden phrases that slip through
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
  forbidden.forEach(phrase => {
    cleaned = cleaned.replace(new RegExp(phrase, "gi"), "");
  });

  return cleaned.trim();
}
