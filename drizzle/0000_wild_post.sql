CREATE TYPE "public"."brand_template" AS ENUM('SBI', 'AIM', 'KW');--> statement-breakpoint
CREATE TABLE "drone_telemetry" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer,
	"battery_level" integer,
	"altitude" double precision,
	"gps_coordinates" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"apn" text NOT NULL,
	"address" text NOT NULL,
	"owner_name" text,
	"zoning_code" text,
	"lot_sqft" integer,
	"climate_zone" text,
	"status" text DEFAULT 'NEW',
	"source" text,
	"lead_score" integer DEFAULT 0,
	"current_rent_total" double precision DEFAULT 0,
	"grant_eligible" boolean DEFAULT false,
	"template_flag" text DEFAULT 'AIM',
	"status_timer" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "properties_apn_unique" UNIQUE("apn")
);
--> statement-breakpoint
CREATE TABLE "simulation_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_type" text,
	"details" text,
	"result_code" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "drone_telemetry" ADD CONSTRAINT "drone_telemetry_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;