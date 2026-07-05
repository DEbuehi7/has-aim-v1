import { createClient } from "@supabase/supabase-js";

function getSupabaseClients() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    throw new Error("Missing required Supabase environment variables");
  }

  return {
    supabase: createClient(supabaseUrl, supabaseAnonKey),
    supabaseAdmin: createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    }),
  };
}

// Lazy getters for runtime access only
export function getSupabase() {
  return getSupabaseClients().supabase;
}

export function getSupabaseAdmin() {
  return getSupabaseClients().supabaseAdmin;
}

// For backward compatibility with existing imports (client-side only)
let cachedSupabase: any = null;
let cachedSupabaseAdmin: any = null;

// Only initialize if in browser
if (typeof window !== "undefined") {
  try {
    const clients = getSupabaseClients();
    cachedSupabase = clients.supabase;
    cachedSupabaseAdmin = clients.supabaseAdmin;
  } catch (e) {
    // Fail silently during hydration
  }
}

export const supabase = cachedSupabase;
export const supabaseAdmin = cachedSupabaseAdmin;
