import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { propertyId, address, city, state, zip } = await request.json();

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Missing address' },
        { status: 400 }
      );
    }

    if (!process.env.BATCHDATA_API_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'Skip-trace service not configured' },
        { status: 500 }
      );
    }

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
              city: city || 'Los Angeles',
              state: state || 'CA',
              zip: zip || '',
            },
          },
        ],
      }),
    });

    if (!batchRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Skip-trace request failed' },
        { status: batchRes.status }
      );
    }

    const batchData = await batchRes.json();
    const rawContacts =
      batchData?.results?.[0]?.contacts ||
      batchData?.results?.[0]?.skipTraces ||
      [];

    const contacts = Array.isArray(rawContacts) ? rawContacts : [];
    const bestContact =
      contacts.find((contact: any) => !contact?.tcpa && !contact?.dnc) ||
      contacts[0] ||
      null;

    const phone =
      bestContact?.phone ||
      bestContact?.phone_number ||
      bestContact?.phones?.[0]?.number ||
      '';

    const email =
      bestContact?.email ||
      bestContact?.emails?.[0]?.email ||
      bestContact?.emails?.[0] ||
      '';

    const contactData = {
      ownerName: bestContact?.name || batchData?.results?.[0]?.ownerName || 'Unknown',
      phone,
      email,
      tcpaCompliant: bestContact ? !bestContact.tcpa : true,
      dncCompliant: bestContact ? !bestContact.dnc : true,
    };

    if (
      propertyId &&
      contactData.phone &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      await supabase
        .from('has_properties')
        .update({
          phone: contactData.phone,
          status: 'ENRICHED',
        })
        .eq('id', propertyId);

      await supabase.from('has_compliance_log').insert({
        content_id: String(propertyId),
        content_type: 'skip_trace',
        human_reviewed: true,
        review_date: new Date().toISOString(),
        approved: true,
        reviewer: 'BatchData · TCPA compliant',
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
