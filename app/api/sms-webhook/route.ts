import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
try {
const text = await req.text();
const params = new URLSearchParams(text);
const from = (params.get('From') || '').trim();
const body = params.get('Body') || '';

console.log(`SMS received from ${from}: ${body}`);

// Notify all inbound
await fetch('https://ntfy.sh/has-sentinel-daniel', {
method: 'POST',
body: `Inbound SMS from ${from}: ${body}`,
headers: {
'Title': 'HAS Sentinel Inbound',
'Priority': 'default',
'Tags': 'speech_balloon',
},
});

// Find matching lead
const { data: lead } = await supabase
.from('has_properties')
.select('id, address, dsa_score, status')
.eq('phone', from)
.maybeSingle();

// Log response
await supabase.from('has_compliance_log').insert({
content_id: lead ? String(lead.id) : 'unknown',
content_type: 'sms_response',
human_reviewed: false,
review_date: new Date().toISOString(),
approved: false,
reviewer: 'system',
notes: `Inbound SMS from ${from}: ${body}${lead ? ` matched to ${lead.address}` : ' no lead match'}`,
});

// Check interest
const interested = ['yes','interested','call','info','tell me more','how much']
.some(kw => body.toLowerCase().includes(kw));

if (interested && lead && lead.status === 'CONTACTED') {
await supabase
.from('has_properties')
.update({ status: 'RESPONDED' })
.eq('id', lead.id);

await fetch('https://ntfy.sh/has-sentinel-daniel', {
method: 'POST',
body: `SELLER RESPONDED: ${lead.address} DSA ${lead.dsa_score} reply: ${body}`,
headers: {
'Title': 'HAS Sentinel Response',
'Priority': 'urgent',
'Tags': 'rotating_light',
},
});
}

const replyMsg = interested && lead
? '<Message>Thank you! Daniel will call you within 24 hours at 323-689-4495. Reply STOP to opt out.</Message>'
: '';

return new NextResponse(
`<?xml version="1.0" encoding="UTF-8"?><Response>${replyMsg}</Response>`,
{ headers: { 'Content-Type': 'text/xml' } }
);

} catch (e) {
console.error('Webhook error:', e);
return new NextResponse(
'<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
{ headers: { 'Content-Type': 'text/xml' }, status: 200 }
);
}
}// v2
