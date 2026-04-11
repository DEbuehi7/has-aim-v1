import {pgTable, serial, text, integer, boolean,
    numeric, timestamp, jsonb, pgEnum
    } from "drizzle-orm/pg-core";
    
    // ── ENUMS ──────────────────────────────────────────────────
    export const leadStatusEnum = pgEnum("lead_status", [
    "NEW", "CONTACTED", "RESPONDED", "NEGOTIATING", "CLOSED"
    ]);
    export const unitStatusEnum = pgEnum("unit_status", [
    "OCCUPIED", "VACANT", "ABATEMENT", "EVICTION", "OFFLINE"
    ]);
    export const dealStatusEnum = pgEnum("deal_status", [
    "PROSPECTING", "UNDER_LOI", "UNDER_CONTRACT", "CLOSED", "DEAD"
    ]);
    export const contactTypeEnum = pgEnum("contact_type", [
    "SELLER", "BUYER", "TENANT", "AGENT", "VENDOR", "PARTNER"
    ]);
    
    // ── has_ PREFIX — HOUSING AUTONOMY SYSTEM ─────────────────
    
    export const has_properties = pgTable("has_properties", {
    id: serial("id").primaryKey(),
    ain: text("ain").unique(),
    address: text("address").notNull(),
    zip: text("zip"),
    city: text("city").default("Los Angeles"),
    state: text("state").default("CA"),
    units: integer("units"),
    zoning: text("zoning"),
    year_built: integer("year_built"),
    sqft: integer("sqft"),
    assessed_value: numeric("assessed_value"),
    // DSA v2 scoring fields
    dsa_score: integer("dsa_score"),
    years_owned: integer("years_owned"),
    imp_land_ratio: numeric("imp_land_ratio"),
    tax_delinquent: boolean("tax_delinquent").default(false),
    // Compliance flags
    rent_control: boolean("rent_control").default(false),
    ula_tax_risk: boolean("ula_tax_risk").default(false),
    ula_tax_impact: numeric("ula_tax_impact"),
    active_violation: boolean("active_violation").default(false),
    deferred_maint: boolean("deferred_maint").default(false),
    days_since_permit:integer("days_since_permit"),
    // Pipeline
    status: leadStatusEnum("status").default("NEW"),
    assignment_fee: numeric("assignment_fee"),
    arv_estimate: numeric("arv_estimate"),
    exit_cap_rate: numeric("exit_cap_rate"),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
    });
    
    export const has_owners = pgTable("has_owners", {
    id: serial("id").primaryKey(),
    property_id: integer("property_id").references(() => has_properties.id),
    name: text("name"),
    entity_type: text("entity_type"),
    phone: text("phone"),
    email: text("email"),
    mailing_address: text("mailing_address"),
    verified: boolean("verified").default(false),
    verification_date: timestamp("verification_date"),
    ownership_confidence: numeric("ownership_confidence"),
    created_at: timestamp("created_at").defaultNow(),
    });
    
    export const has_units = pgTable("has_units", {
    id: serial("id").primaryKey(),
    property_id: integer("property_id").references(() => has_properties.id),
    unit_number: text("unit_number"),
    status: unitStatusEnum("status").default("OCCUPIED"),
    sqft: integer("sqft"),
    rent_amount: numeric("rent_amount"),
    subsidy_type: text("subsidy_type"),
    hap_hold: boolean("hap_hold").default(false),
    abatement_items: jsonb("abatement_items"),
    created_at: timestamp("created_at").defaultNow(),
    });
    
    export const has_tenants = pgTable("has_tenants", {
    id: serial("id").primaryKey(),
    unit_id: integer("unit_id").references(() => has_units.id),
    property_id: integer("property_id").references(() => has_properties.id),
    name: text("name"),
    phone: text("phone"),
    email: text("email"),
    move_in_date: timestamp("move_in_date"),
    lease_end: timestamp("lease_end"),
    subsidy: text("subsidy"),
    balance_owed: numeric("balance_owed"),
    eviction_status: text("eviction_status"),
    created_at: timestamp("created_at").defaultNow(),
    });
    
    export const has_deals = pgTable("has_deals", {
    id: serial("id").primaryKey(),
    property_id: integer("property_id").references(() => has_properties.id),
    seller_ask: numeric("seller_ask"),
    arv_estimate: numeric("arv_estimate"),
    noi_estimate: numeric("noi_estimate"),
    exit_cap_rate: numeric("exit_cap_rate"),
    repair_estimate: numeric("repair_estimate"),
    assignment_fee: numeric("assignment_fee"),
    ula_tax_risk: boolean("ula_tax_risk").default(false),
    ula_impact: numeric("ula_impact"),
    status: dealStatusEnum("status").default("PROSPECTING"),
    contract_date: timestamp("contract_date"),
    close_date: timestamp("close_date"),
    created_at: timestamp("created_at").defaultNow(),
    });
    
    export const has_contacts = pgTable("has_contacts", {
    id: serial("id").primaryKey(),
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    org: text("org"),
    contact_type: contactTypeEnum("contact_type"),
    property_id: integer("property_id").references(() => has_properties.id),
    dsa_match_id: integer("dsa_match_id").references(() => has_properties.id),
    zip: text("zip"),
    score: integer("score"),
    source: text("source"),
    notes: text("notes"),
    created_at: timestamp("created_at").defaultNow(),
    });
    
    export const has_maintenance = pgTable("has_maintenance", {
    id: serial("id").primaryKey(),
    property_id: integer("property_id").references(() => has_properties.id),
    unit_id: integer("unit_id").references(() => has_units.id),
    description: text("description"),
    category: text("category"),
    priority: text("priority"),
    status: text("status").default("OPEN"),
    tech_assigned:text("tech_assigned"),
    cost_estimate:numeric("cost_estimate"),
    resolved_at: timestamp("resolved_at"),
    created_at: timestamp("created_at").defaultNow(),
    });
    
    export const has_compliance_log = pgTable("has_compliance_log", {
    id: serial("id").primaryKey(),
    content_id: text("content_id"),
    content_type: text("content_type"),
    human_reviewed: boolean("human_reviewed").default(false),
    review_date: timestamp("review_date"),
    approved: boolean("approved").default(false),
    reviewer: text("reviewer"),
    notes: text("notes"),
    created_at: timestamp("created_at").defaultNow(),
    });
    
    // ── aimedia_ PREFIX — PLANETARY ENGINE ────────────────────
    
    export const aimedia_planets = pgTable("aimedia_planets", {
    id: serial("id").primaryKey(),
    token: text("token").unique().notNull(),
    label: text("label"),
    palette: jsonb("palette"),
    sky: text("sky"),
    identity_object: text("identity_object"),
    created_at: timestamp("created_at").defaultNow(),
    });
    
    export const aimedia_characters = pgTable("aimedia_characters", {
    id: serial("id").primaryKey(),
    planet_id: integer("planet_id").references(() => aimedia_planets.id),
    name: text("name"),
    style_pack: jsonb("style_pack"),
    created_at: timestamp("created_at").defaultNow(),
    });
    
    export const aimedia_motion_jobs = pgTable("aimedia_motion_jobs", {
    id: serial("id").primaryKey(),
    character_id: integer("character_id").references(() => aimedia_characters.id),
    source_type: text("source_type"),
    tool: text("tool"),
    status: text("status").default("QUEUE"),
    skeletal_json:jsonb("skeletal_json"),
    variation_pct:numeric("variation_pct"),
    created_at: timestamp("created_at").defaultNow(),
    });
    
    export const aimedia_render_jobs = pgTable("aimedia_render_jobs", {
    id: serial("id").primaryKey(),
    motion_job_id: integer("motion_job_id").references(() => aimedia_motion_jobs.id),
    planet_id: integer("planet_id").references(() => aimedia_planets.id),
    status: text("status").default("QUEUE"),
    render_pct: integer("render_pct").default(0),
    output_url: text("output_url"),
    compliance_reviewed: boolean("compliance_reviewed").default(false),
    created_at: timestamp("created_at").defaultNow(),
    });
    
    // ── aura8_ PREFIX — CONTENT GRID ──────────────────────────
    
    export const aura8_nodes = pgTable("aura8_nodes", {
    id: serial("id").primaryKey(),
    title: text("title"),
    category: text("category"),
    body_type: text("body_type"),
    skin_type: text("skin_type"),
    affiliate_url: text("affiliate_url"),
    affiliate_type: text("affiliate_type").default("flat"),
    click_count: integer("click_count").default(0),
    engagement_score: integer("engagement_score").default(0),
    is_hot_node: boolean("is_hot_node").default(false),
    is_sponsored: boolean("is_sponsored").default(false),
    sponsor_expiry: timestamp("sponsor_expiry"),
    lens_visibility: text("lens_visibility").array(),
    zip_code: text("zip_code"),
    pending_revenue: numeric("pending_revenue").default("0"),
    cleared_revenue: numeric("cleared_revenue").default("0"),
    ab_test_variant: text("ab_test_variant"),
    created_at: timestamp("created_at").defaultNow(),
    });
    
    export const aura8_subscriptions = pgTable("aura8_subscriptions", {
    id: serial("id").primaryKey(),
    user_id: text("user_id"),
    stripe_customer_id: text("stripe_customer_id"),
    tier: text("tier"),
    status: text("status"),
    renewal_date: timestamp("renewal_date"),
    cancelled_at: timestamp("cancelled_at"),
    created_at: timestamp("created_at").defaultNow(),
    });
    
    export const aura8_lifetime_commissions = pgTable("aura8_lifetime_commissions", {
    id: serial("id").primaryKey(),
    partner_id: text("partner_id"),
    partner_name: text("partner_name"),
    referral_count: integer("referral_count").default(0),
    monthly_earnings: numeric("monthly_earnings").default("0"),
    total_earned: numeric("total_earned").default("0"),
    last_updated: timestamp("last_updated").defaultNow(),
    });
    
    // ── aim_ PREFIX — OS / INTELLIGENCE LAYER ─────────────────
    
    export const aim_verticals = pgTable("aim_verticals", {
    id: serial("id").primaryKey(),
    code: text("code").unique().notNull(),
    full_name:text("full_name"),
    tier: text("tier"),
    color: text("color"),
    active: boolean("active").default(true),
    created_at: timestamp("created_at").defaultNow(),
    });
    
    export const aim_queries = pgTable("aim_queries", {
    id: serial("id").primaryKey(),
    layer: text("layer"),
    model: text("model"),
    domain: text("domain"),
    mode: text("mode"),
    query_text: text("query_text"),
    response_text: text("response_text"),
    strategy_flags: text("strategy_flags").array(),
    verticals: text("verticals").array(),
    created_at: timestamp("created_at").defaultNow(),
    });
    
    export const aim_scraper_leads = pgTable("aim_scraper_leads", {
    id: serial("id").primaryKey(),
    property_id: integer("property_id").references(() => has_properties.id),
    source: text("source"),
    raw_data: jsonb("raw_data"),
    processed: boolean("processed").default(false),
    created_at: timestamp("created_at").defaultNow(),
    });