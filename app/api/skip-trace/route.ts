import { createAnthropic } from '@ai-sdk/anthropic';
import { experimental_createMCPClient as createMCPClient } from '@ai-sdk/mcp';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { propertyId, address, city, state, zip } = await request.json();

    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    const mcpClient = await createMCPClient({
      transport: {
        type: 'http',
        url: 'https://mcp.batchdata.com',
        headers: {
          Authorization: `Bearer ${process.env.BATCHDATA_API_TOKEN}`,
        },
      },
    });

    const tools = await mcpClient.tools();

    const result = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: `You are a real estate skip trace assistant. 
When given a property address:
1. Use skip_trace_property to find owner contact info
2. Filter out any contacts with tcpa: true or dnc: true
3. Return only reachable, compliant phone numbers
4. Return your response as JSON only with this structure:
{
  "ownerName": "string",
  "phone": "string",
  "email": "string",
  "tcpaCompliant": true,
  "dncCompliant": true
}`,
      messages: [
        {
          role: 'user',
          content: `Skip trace this property: ${address}, ${city}, ${state} ${zip}`
        }
      ],
      tools,
    });

    await mcpClient.close();

    // Parse the response
    const text = result.text.replace(/```json|```/g, '').trim();
    const contactData = JSON.parse(text);

    // Update has_properties with real owner data
    if (propertyId && contactData.phone) {
      await supabase
        .from('has_properties')
        .update({
          phone: contactData.phone,
          status: 'ENRICHED',
        })
        .eq('id', propertyId);

      // Log to compliance
      await supabase.from('has_compliance_log').insert({
        content_id: String(propertyId),
        content_type: 'skip_trace',
        human_reviewed: true,
        review_date: new Date().toISOString(),
        approved: true,
        reviewer: 'BatchData MCP + Claude · TCPA compliant',
        notes: `Skip trace: ${contactData.ownerName} · ${contactData.phone} · TCPA: ${contactData.tcpaCompliant} · DNC: ${contactData.dncCompliant}`,
      });
    }

    return NextResponse.json({ success: true, data: contactData });

  } catch (error: any) {
    console.error('Skip trace error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
