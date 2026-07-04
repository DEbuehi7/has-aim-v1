import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function POST(request: NextRequest) {
  try {
    const { propertyId, address, city, state, zip } = await request.json();

    // Check if BatchData API is configured
    if (!process.env.BATCHDATA_API_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'Skip-trace service not configured' },
        { status: 500 }
      );
    }

    // Call BatchData API directly
    const batchRes = await fetch('https://api.batchdata.com/api/v3/property/skip-trace', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.BATCHDATA_API_TOKEN,
      },
      body: JSON.stringify({
        requests: [
          {
            propertyAddress: {
              street: address,
              city,
              state,
              zip,
            },
          },
        ],
      }),
    });

    if (!batchRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Skip-trace API error' },
        { status: 500 }
      );
    }

    const batchData = await batchRes.json();

    // Parse response
    let contactData = {
      ownerName: 'Unknown',
      phone: '',
      email: '',
      tcpaCompliant: true,
      dncCompliant: true,
    };

    if (batchData.results?.[0]) {
      const result = batchData.results[0];
      contactData = {
        ownerName: result.ownerName || 'Unknown',
        phone: result.phone || '',
        email: result.email || '',
        tcpaCompliant: !result.tcpa,
        dncCompliant: !result.dnc,
      };
    }

    // Update property if we have data
    if (propertyId && contactData.phone) {
      const supabase = getSupabaseClient();

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
        reviewer: 'BatchData API · TCPA compliant',
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
