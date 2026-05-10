CREATE TYPE "public"."contact_type" AS ENUM('SELLER', 'BUYER', 'TENANT', 'AGENT', 'VENDOR', 'PARTNER');--> statement-breakpoint
CREATE TYPE "public"."deal_status" AS ENUM('PROSPECTING', 'UNDER_LOI', 'UNDER_CONTRACT', 'CLOSED', 'DEAD');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('NEW', 'CONTACTED', 'RESPONDED', 'NEGOTIATING', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."unit_status" AS ENUM('OCCUPIED', 'VACANT', 'ABATEMENT', 'EVICTION', 'OFFLINE');--> statement-breakpoint
CREATE TABLE "aim_queries" (
	"id" serial PRIMARY KEY NOT NULL,
	"layer" text,
	"model" text,
	"domain" text,
	"mode" text,
	"query_text" text,
	"response_text" text,
	"strategy_flags" text[],
	"verticals" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "aim_scraper_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer,
	"source" text,
	"raw_data" jsonb,
	"processed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "aim_verticals" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"full_name" text,
	"tier" text,
	"color" text,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "aim_verticals_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "aimedia_characters" (
	"id" serial PRIMARY KEY NOT NULL,
	"planet_id" integer,
	"name" text,
	"style_pack" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "aimedia_motion_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"character_id" integer,
	"source_type" text,
	"tool" text,
	"status" text DEFAULT 'QUEUE',
	"skeletal_json" jsonb,
	"variation_pct" numeric,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "aimedia_planets" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"label" text,
	"palette" jsonb,
	"sky" text,
	"identity_object" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "aimedia_planets_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "aimedia_render_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"motion_job_id" integer,
	"planet_id" integer,
	"status" text DEFAULT 'QUEUE',
	"render_pct" integer DEFAULT 0,
	"output_url" text,
	"compliance_reviewed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "aura8_lifetime_commissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" text,
	"partner_name" text,
	"referral_count" integer DEFAULT 0,
	"monthly_earnings" numeric DEFAULT '0',
	"total_earned" numeric DEFAULT '0',
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "aura8_nodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"category" text,
	"body_type" text,
	"skin_type" text,
	"affiliate_url" text,
	"affiliate_type" text DEFAULT 'flat',
	"click_count" integer DEFAULT 0,
	"engagement_score" integer DEFAULT 0,
	"is_hot_node" boolean DEFAULT false,
	"is_sponsored" boolean DEFAULT false,
	"sponsor_expiry" timestamp,
	"lens_visibility" text[],
	"zip_code" text,
	"pending_revenue" numeric DEFAULT '0',
	"cleared_revenue" numeric DEFAULT '0',
	"ab_test_variant" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "aura8_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"stripe_customer_id" text,
	"tier" text,
	"status" text,
	"renewal_date" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "has_compliance_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" text,
	"content_type" text,
	"human_reviewed" boolean DEFAULT false,
	"review_date" timestamp,
	"approved" boolean DEFAULT false,
	"reviewer" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "has_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"phone" text,
	"org" text,
	"contact_type" "contact_type",
	"property_id" integer,
	"dsa_match_id" integer,
	"zip" text,
	"score" integer,
	"source" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "has_deals" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer,
	"seller_ask" numeric,
	"arv_estimate" numeric,
	"noi_estimate" numeric,
	"exit_cap_rate" numeric,
	"repair_estimate" numeric,
	"assignment_fee" numeric,
	"ula_tax_risk" boolean DEFAULT false,
	"ula_impact" numeric,
	"status" "deal_status" DEFAULT 'PROSPECTING',
	"contract_date" timestamp,
	"close_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "has_maintenance" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer,
	"unit_id" integer,
	"description" text,
	"category" text,
	"priority" text,
	"status" text DEFAULT 'OPEN',
	"tech_assigned" text,
	"cost_estimate" numeric,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "has_owners" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer,
	"name" text,
	"entity_type" text,
	"phone" text,
	"email" text,
	"mailing_address" text,
	"verified" boolean DEFAULT false,
	"verification_date" timestamp,
	"ownership_confidence" numeric,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "has_properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"ain" text,
	"address" text NOT NULL,
	"zip" text,
	"city" text DEFAULT 'Los Angeles',
	"state" text DEFAULT 'CA',
	"units" integer,
	"zoning" text,
	"year_built" integer,
	"sqft" integer,
	"assessed_value" numeric,
	"dsa_score" integer,
	"years_owned" integer,
	"imp_land_ratio" numeric,
	"tax_delinquent" boolean DEFAULT false,
	"rent_control" boolean DEFAULT false,
	"ula_tax_risk" boolean DEFAULT false,
	"ula_tax_impact" numeric,
	"active_violation" boolean DEFAULT false,
	"deferred_maint" boolean DEFAULT false,
	"days_since_permit" integer,
	"status" "lead_status" DEFAULT 'NEW',
	"assignment_fee" numeric,
	"arv_estimate" numeric,
	"exit_cap_rate" numeric,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "has_properties_ain_unique" UNIQUE("ain")
);
--> statement-breakpoint
CREATE TABLE "has_tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"unit_id" integer,
	"property_id" integer,
	"name" text,
	"phone" text,
	"email" text,
	"move_in_date" timestamp,
	"lease_end" timestamp,
	"subsidy" text,
	"balance_owed" numeric,
	"eviction_status" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "has_units" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer,
	"unit_number" text,
	"status" "unit_status" DEFAULT 'OCCUPIED',
	"sqft" integer,
	"rent_amount" numeric,
	"subsidy_type" text,
	"hap_hold" boolean DEFAULT false,
	"abatement_items" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "drone_telemetry" CASCADE;--> statement-breakpoint
DROP TABLE "properties" CASCADE;--> statement-breakpoint
DROP TABLE "simulation_logs" CASCADE;--> statement-breakpoint
ALTER TABLE "aim_scraper_leads" ADD CONSTRAINT "aim_scraper_leads_property_id_has_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."has_properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aimedia_characters" ADD CONSTRAINT "aimedia_characters_planet_id_aimedia_planets_id_fk" FOREIGN KEY ("planet_id") REFERENCES "public"."aimedia_planets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aimedia_motion_jobs" ADD CONSTRAINT "aimedia_motion_jobs_character_id_aimedia_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."aimedia_characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aimedia_render_jobs" ADD CONSTRAINT "aimedia_render_jobs_motion_job_id_aimedia_motion_jobs_id_fk" FOREIGN KEY ("motion_job_id") REFERENCES "public"."aimedia_motion_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aimedia_render_jobs" ADD CONSTRAINT "aimedia_render_jobs_planet_id_aimedia_planets_id_fk" FOREIGN KEY ("planet_id") REFERENCES "public"."aimedia_planets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "has_contacts" ADD CONSTRAINT "has_contacts_property_id_has_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."has_properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "has_contacts" ADD CONSTRAINT "has_contacts_dsa_match_id_has_properties_id_fk" FOREIGN KEY ("dsa_match_id") REFERENCES "public"."has_properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "has_deals" ADD CONSTRAINT "has_deals_property_id_has_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."has_properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "has_maintenance" ADD CONSTRAINT "has_maintenance_property_id_has_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."has_properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "has_maintenance" ADD CONSTRAINT "has_maintenance_unit_id_has_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."has_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "has_owners" ADD CONSTRAINT "has_owners_property_id_has_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."has_properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "has_tenants" ADD CONSTRAINT "has_tenants_unit_id_has_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."has_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "has_tenants" ADD CONSTRAINT "has_tenants_property_id_has_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."has_properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "has_units" ADD CONSTRAINT "has_units_property_id_has_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."has_properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."brand_template";