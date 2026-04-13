import { pgTable, serial, text, integer, boolean, timestamp, doublePrecision, pgEnum } from 'drizzle-orm/pg-core';
// Brand template options
export const brandEnum = pgEnum('brand_template', ['SBI', 'AIM', 'KW']);

export const properties = pgTable('properties', {
id: serial('id').primaryKey(),
apn: text('apn').unique().notNull(),
address: text('address').notNull(),
owner_name: text('owner_name'),
zoning_code: text('zoning_code'),
lot_sqft: integer('lot_sqft'),
climate_zone: text('climate_zone'), // e.g., 'Zone 10' for 29 Palms
status: text('status').default('NEW'), // NEW, ANALYZED, DELINQUENT
source: text('source'), // LA_COUNTY_SCRAPER, PROPSTREAM

// Lead Scoring & Financials
lead_score: integer('lead_score').default(0),
current_rent_total: doublePrecision('current_rent_total').default(0),
grant_eligible: boolean('grant_eligible').default(false),

// Branding & Timers
template_flag: text('template_flag').default('AIM'), // SBI | AIM | KW
status_timer: timestamp('status_timer'),

created_at: timestamp('created_at').defaultNow(),
updated_at: timestamp('updated_at').defaultNow(),
});

export const droneTelemetry = pgTable('drone_telemetry', {
id: serial('id').primaryKey(),
property_id: integer('property_id').references(() => properties.id),
battery_level: integer('battery_level'),
altitude: doublePrecision('altitude'),
gps_coordinates: text('gps_coordinates'),
timestamp: timestamp('timestamp').defaultNow(),
});

export const simulationLogs = pgTable('simulation_logs', {
id: serial('id').primaryKey(),
event_type: text('event_type'), // 'AUTONOMOUS_BUILD_TEST', 'MARKET_STRESS_TEST'
details: text('details'),
result_code: text('result_code'),
created_at: timestamp('created_at').defaultNow(),
});