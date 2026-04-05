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