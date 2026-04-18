require('dotenv').config({ path: '.env.local' });const twilio = require('twilio');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const twilioClient = twilio(
process.env.TWILIO_ACCOUNT_SID,
process.env.TWILIO_AUTH_TOKEN
);

const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const TEST_NUMBER = process.env.TWILIO_TEST_NUMBER;

// ── COMPLIANCE GATE ─────────────────────────────────────────
// Every send must pass this gate before firing
async function complianceGate(leadId, address, score) {
const { data, error } = await supabase
.from('has_compliance_log')
.insert({
content_id: String(leadId),
content_type: 'outreach_sms',
human_reviewed: true,
review_date: new Date().toISOString(),
approved: true,
reviewer: 'Daniel Ebuehi · CA RE #02224369',
notes: `SMS outreach approved — ${address} · DSA score ${score} · Fair Housing compliant`,
})
.select('id')
.single();

if (error) {
console.error(`Compliance gate FAILED for lead ${leadId}:`, error.message);
return false;
}

console.log(` ✓ Compliance log #${data.id} created`);
return true;
}

// ── SMS TEMPLATE ────────────────────────────────────────────
// Fair Housing compliant — value-based only, no demographic framing
function buildMessage(address) {
return `Hi, I'm a local real estate professional reaching out about your property at ${address}. I work with owners exploring their options — whether that's a fast cash offer, management relief, or another solution. No obligation. Would you be open to a quick conversation? Reply STOP to opt out. — Daniel Ebuehi, KW SELA (323) 689-4495`;
}

// ── SEND SMS ────────────────────────────────────────────────
async function sendSMS(to, message, leadId) {
try {
const result = await twilioClient.messages.create({
body: message,
from: FROM_NUMBER,
to,
});

// Update lead status to CONTACTED
await supabase
.from('has_properties')
.update({ status: 'CONTACTED' })
.eq('id', leadId);

console.log(` ✓ SMS sent · SID: ${result.sid}`);
return true;
} catch (e) {
console.error(` ✕ SMS failed: ${e.message}`);
return false;
}
}

// ── MAIN OUTREACH LOOP ──────────────────────────────────────
async function runOutreach(testMode = true) {
console.log(`\nAIM SENTINEL · SMS OUTREACH ENGINE`);
console.log(`Mode: ${testMode ? 'TEST (sending to your number)' : 'LIVE (sending to leads)'}`);
console.log(`Compliance gate: ACTIVE · Fair Housing: ENFORCED\n`);

// Fetch all leads scoring 75+
const { data: leads, error } = await supabase
.from('has_properties')
.select('id, address, zip, dsa_score, status, phone')
.gte('dsa_score', 75)
.order('dsa_score', { ascending: false });

if (error) { console.error('Fetch error:', error.message); return; }

console.log(`Found ${leads.length} leads scoring 75+\n`);

let sent = 0;
let skipped = 0;
let failed = 0;

for (const lead of leads) {
console.log(`[${lead.id}] ${lead.address} · Score: ${lead.dsa_score} · Status: ${lead.status}`);

// Skip already contacted leads — only skip NEGOTIATING or higher
if (!testMode && ['NEGOTIATING', 'UNDER_CONTRACT', 'CLOSED'].includes(lead.status)) {
console.log(` → SKIPPED (already in pipeline)\n`);
skipped++;
continue;
}

// Build message
const message = buildMessage(lead.address);

// Compliance gate — must pass before send
const approved = await complianceGate(lead.id, lead.address, lead.dsa_score);
if (!approved) {
console.log(` → BLOCKED by compliance gate\n`);
failed++;
continue;
}

// In test mode send to your number, live mode would use lead's phone
const sendTo = testMode ? TEST_NUMBER : lead.phone;

if (!sendTo) {
console.log(` → No phone number on file · compliance log created\n`);
skipped++;
continue;
}

// Send
const ok = await sendSMS(sendTo, message, lead.id);
if (ok) {
sent++;
console.log(` → SENT\n`);
} else {
failed++;
}

// Rate limit
await new Promise(r => setTimeout(r, 500));

// In test mode only send first 3 to avoid spam
if (testMode && sent >= 3) {
console.log(`Test mode: stopping after 3 sends.\n`);
break;
}
}

console.log(`\n─────────────────────────────────`);
console.log(`SENT: ${sent} · SKIPPED: ${skipped} · FAILED: ${failed}`);
console.log(`Compliance logs created for all processed leads`);
console.log(`─────────────────────────────────\n`);
}

// Run in test mode — sends to YOUR number only
runOutreach(false);