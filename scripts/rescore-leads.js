require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// DSA v2 scoring weights
function calculateDSAScore(lead) {
let score = 0;

// Years owned (max 25 pts)
if (lead.years_owned >= 30) score += 25;
else if (lead.years_owned >= 20) score += 20;
else if (lead.years_owned >= 15) score += 15;
else if (lead.years_owned >= 10) score += 10;
else score += 5;

// Improvement to land ratio (max 20 pts)
if (lead.imp_land_ratio <= 0.30) score += 20;
else if (lead.imp_land_ratio <= 0.40) score += 15;
else if (lead.imp_land_ratio <= 0.50) score += 10;
else score += 5;

// Tax delinquent (20 pts)
if (lead.tax_delinquent) score += 20;

// Deferred maintenance / no permit (15 pts)
if (lead.deferred_maint) score += 15;

// Active violation (10 pts)
if (lead.active_violation) score += 10;

// Rent control (5 pts — motivated seller signal)
if (lead.rent_control) score += 5;

// Days since permit bonus (max 5 pts)
if (lead.days_since_permit >= 5475) score += 5; // 15+ years
else if (lead.days_since_permit >= 3650) score += 3; // 10+ years
else if (lead.days_since_permit >= 1825) score += 1; // 5+ years

return Math.min(100, score);
}

async function rescoreAll() {
console.log('DSA v2 Rescore Engine — SBI Capital\n');

const { data: leads, error } = await supabase
.from('has_properties')
.select('*');

if (error) { console.error('Error:', error.message); return; }

console.log(`Rescoring ${leads.length} leads...\n`);

let updated = 0;
let unchanged = 0;

for (const lead of leads) {
const newScore = calculateDSAScore(lead);
const oldScore = lead.dsa_score;

if (newScore === oldScore) {
unchanged++;
continue;
}

// Log score change to history
await supabase.from('has_score_history').insert({
property_id: lead.id,
old_score: oldScore,
new_score: newScore,
trigger: 'manual_rescore',
});

// Update lead score
await supabase.from('has_properties')
.update({ dsa_score: newScore })
.eq('id', lead.id);

const direction = newScore > oldScore ? '↑' : '↓';
console.log(`[${lead.id}] ${lead.address} — ${oldScore} ${direction} ${newScore}`);
updated++;
}

console.log(`\nComplete — ${updated} rescored · ${unchanged} unchanged`);
}

rescoreAll();