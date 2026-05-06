import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const { message, history } = await request.json();
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [{ data: leads }, { data: deals }, { data: decisions }] = await Promise.all([
    supabase.from('has_properties').select('address,dsa_score,status,phone').gte('dsa_score',78).limit(5),
    supabase.from('has_deals').select('*').limit(3),
    supabase.from('pure_decision_queue').select('*').eq('status','PENDING').limit(3),
  ]);

  const systemPrompt = `You are Pure — the intelligence layer of the AIM OS.
You have live access to HAS Sentinel data for Daniel Ebuehi.

IDENTITY: Daniel Ebuehi · UPenn M.Arch 2011 · CA RE #02224369 · KW SELA
ENTITY STACK: SBI Capital → AIM LLC → Hanwa Innovation Solutions
PROPERTIES: Weldon Hotel (55 units) · Simone Hotel (114 units) · DTLA

LIVE DATA:
Top Leads (DSA 78+): ${JSON.stringify(leads?.slice(0,5))}
Active Deals: ${JSON.stringify(deals)}
Pending Decisions: ${JSON.stringify(decisions)}

Be concise. Answer in 2-3 sentences max.
Reference live data when available.
For update requests — propose the change and ask for confirmation.`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: systemPrompt,
    messages: [...(history || []), { role: 'user', content: message }],
  });

  const reply = response.content[0].type === 'text' ? response.content[0].text : '';

  await supabase.from('aim_activity_log').insert({
    platform: 'Pure',
    action: 'CHAT_QUERY',
    agent: 'Daniel Ebuehi',
    status: 'SUCCESS',
    input_summary: message.slice(0,100),
    output_summary: reply.slice(0,100),
  });

  return NextResponse.json({ reply });
}
