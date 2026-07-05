import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function ComplianceReviewPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect('/aura8/compliance-login');
  }

  async function logout() {
    'use server';
    const s = await createClient();
    await s.auth.signOut();
    redirect('/aura8/compliance-login');
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Compliance Portal</h1>
          <form action={logout}>
            <button className="rounded-md border border-zinc-700 px-3 py-2 text-sm">
              Log out
            </button>
          </form>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          Authenticated. Sinisha can access the portal.
        </div>
      </div>
    </main>
  );
}
