<<<<<<< HEAD
import type { Config } from "drizzle-kit";import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

export default {
schema: "./src/db/schema.ts",
out: "./drizzle",
dialect: "postgresql",
dbCredentials: {
url: process.env.DATABASE_URL!,
},
} satisfies Config;
=======
import { config } from 'dotenv';import { defineConfig } from 'drizzle-kit';

// This line specifically tells Drizzle where to find your Supabase key
config({ path: '.env.local' });

export default defineConfig({
schema: './packages/db/schema.ts',
out: './drizzle',
dialect: 'postgresql',
dbCredentials: {
url: process.env.DATABASE_URL!,
},
});
>>>>>>> e4f6b16fb9136be458c0ade4b5815dda5f15b037
