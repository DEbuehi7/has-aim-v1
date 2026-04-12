require('dotenv').config({ path: '.env.local' });const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const LADBS_API = 'https://data.lacity.org/resource/pi9x-tg5x.json';

async function getLatestPermit(address, zipCode) {
// Clean address for query — uppercase, remove unit numbers
const cleanAddress = address.toUpperCase()
.replace(/\s+(APT|UNIT|STE|#).*$/i, '')
.trim();

const url = `${LADBS_API}?$limit=5&$order=issue_date DESC` +
`&zip_code=${zipCode}` +
`&$where=primary_address like '%25${cleanAddress.split(' ')[0]}%25'`;

try {
const res = await fetch(url);
const data = await res.json();
if (!data || data.error || data.length === 0) return null;
// Return most recent permit
return data[0];
} catch (e) {
return null;
}
}

function daysSince(dateStr) {
if (!dateStr) return null;
const diff = Date.now() - new Date(dateStr).getTime();
return Math.floor(diff / (1000 * 60 * 60 * 24));
}

async function scrapeAll() {
console.log('Fetching leads from Supabase...');
const { data: leads, error } = await supabase
.from('has_properties')
.select('id, address, zip, dsa_score, days_since_permit, active_violation');

if (error) { console.error('Fetch error:', error.message); return; }
console.log(`Processing ${leads.length} leads...\n`);

let updated = 0;
let noPermit = 0;

for (const lead of leads) {
process.stdout.write(`[${lead.id}] ${lead.address} (${lead.zip})... `);

const permit = await getLatestPermit(lead.address, lead.zip);

if (!permit) {
// No permit found = deferred maintenance flag
const { error: updateErr } = await supabase
.from('has_properties')
.update({
deferred_maint: true,
days_since_permit: 9999, // No permit on record
})
.eq('id', lead.id);

console.log('NO PERMIT FOUND → deferred_maint=true');
noPermit++;
continue;
}

const days = daysSince(permit.issue_date);
const isDeferred = days > 1825; // 5+ years = deferred
const newScore = lead.active_violation
? Math.min(100, lead.dsa_score + 15)
: lead.dsa_score;

const { error: updateErr } = await supabase
.from('has_properties')
.update({
days_since_permit: days,
deferred_maint: isDeferred,
dsa_score: newScore,
})
.eq('id', lead.id);

if (updateErr) {
console.log(`ERROR: ${updateErr.message}`);
} else {
console.log(`✓ ${days} days since permit · deferred=${isDeferred} · score=${newScore}`);
updated++;
}

// Rate limit — be respectful to the API
await new Promise(r => setTimeout(r, 300));
}

console.log(`\n✅ Done — ${updated} updated · ${noPermit} no permit found`);
}

scrapeAll();