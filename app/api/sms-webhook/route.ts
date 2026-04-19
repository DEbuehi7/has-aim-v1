import { createClient } from '@supabase/supabase-js';import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
const formData = await req.formData();

const from = formData.get('From') as string;
const body = formData.get('Body') as string;
const to = formData.get('To') as string;

console.log(`SMS received from ${from}: ${body}`);

// Notify for all inbound SMS
await fetch('https://ntfy.sh/has-sentinel-daniel', {
    method: 'POST',
    body: `📱 Inbound SMS from ${from}: "${body}"`,
    headers: {
    'Title': 'HAS Sentinel — Inbound SMS',
    'Priority': 'default',
    'Tags': 'speech_balloon',
    },
    });

// Find matching lead by phone number
const { data: lead } = await supabase
.from('has_properties')
.select('id, address, dsa_score, status')
.eq('phone', from)
.single();

// Log the response
await supabase.from('has_compliance_log').insert({
content_id: lead ? String(lead.id) : 'unknown',
content_type: 'sms_response',
human_reviewed: false,
review_date: new Date().toISOString(),
approved: false,
reviewer: 'system',
notes: `Inbound SMS from ${from}: "${body}" ${lead ? `— matched to ${lead.address}` : '— no lead match'}`,
});

// If seller responds with interest — auto-update status
const interested = ['yes', 'interested', 'call', 'info', 'tell me more', 'how much']
.some(keyword => body.toLowerCase().includes(keyword));

if (interested && lead && lead.status === 'CONTACTED') {
await supabase
.from('has_properties')
.update({ status: 'RESPONDED' })
.eq('id', lead.id);

console.log(`Lead ${lead.address} auto-updated to RESPONDED`);
}

// Push notification to your phone via ntfy.sh
await fetch('https://ntfy.sh/has-sentinel-daniel', {
    method: 'POST',
    body: `🔥 SELLER RESPONDED: ${lead.address} (DSA ${lead.dsa_score}) — "${body}" — Call (323) 689-4495`,
    headers: {
    'Title': 'HAS Sentinel — Seller Response',
    'Priority': 'urgent',
    'Tags': 'rotating_light',
    },
    });

// Return TwiML response
const twiml = interested
? `<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Message>Thank you for your interest! Daniel Ebuehi will call you within 24 hours at (323) 689-4495. Reply STOP to opt out.</Message>
</Response>`
: `<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>`;

return new NextResponse(twiml, {
headers: { 'Content-Type': 'text/xml' },
});
}