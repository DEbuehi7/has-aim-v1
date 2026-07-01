export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';

export default async function CallscriptPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Build-safe fallback: do NOT initialize Supabase if env is missing
  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <div className="mx-auto max-w-3xl rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h1 className="text-2xl font-semibold mb-2">Callscript</h1>
          <p className="text-zinc-300">
            Callscript is temporarily unavailable: Supabase environment variables are not configured.
          </p>
        </div>
      </main>
    );
  }

  // Runtime-only initialization
  const supabase = await createClient();

  // Optional: if this page should require auth
  const { data: authData } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="mx-auto max-w-3xl rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="text-2xl font-semibold mb-2">Callscript</h1>
        <p className="text-zinc-300 mb-4">
          {authData?.user
            ? `Signed in as ${authData.user.email ?? 'user'}`
            : 'Viewing as guest'}
        </p>

        <div className="rounded-lg border border-zinc-700 p-4 text-zinc-200">
          Your callscript content renders safely now.
        </div>
      </div>
    </main>
  );
}
