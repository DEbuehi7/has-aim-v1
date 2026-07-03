import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aura8 Login",
  description: "Static Railway-ready Aura8 login landing page",
};

const quickLinks = [
  {
    href: "/api/health",
    label: "Health check",
    note: "Returns 200 with app and database status.",
  },
  {
    href: "/api/ccbill/webhook",
    label: "Webhook endpoint",
    note: "GET returns 200 so CCBill can verify reachability.",
  },
  {
    href: "/aura8/compliance-login",
    label: "Secure compliance login",
    note: "Continue here for credentialed access.",
  },
];

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#05050A] px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-fuchsia-500/20 bg-black/60 p-8 shadow-2xl shadow-fuchsia-950/30 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-fuchsia-400">
          Aura8 v0 · Railway readiness
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Static login checkpoint
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300">
          This page is rendered on the server with a hardcoded route so reviewers
          can verify the app is live before signing in. If you were sent here by
          CCBill, the deployment is up and responding.
        </p>

        <form
          action="/aura8/compliance-login"
          method="get"
          className="mt-8 grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 md:grid-cols-2"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-zinc-400"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="compliance@ccbill.com"
              className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-fuchsia-400"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-zinc-400"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Provided separately"
              className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-fuchsia-400"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-fuchsia-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-400"
            >
              Open secure login
            </button>
          </div>
        </form>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {quickLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 transition hover:border-fuchsia-500/40 hover:bg-zinc-900"
            >
              <div className="text-sm font-semibold text-white">{link.label}</div>
              <div className="mt-2 text-sm leading-6 text-zinc-400">
                {link.note}
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
