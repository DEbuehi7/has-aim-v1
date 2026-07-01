"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ComplianceLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/compliance-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      const data = await res.json();
      localStorage.setItem("compliance_session_token", data.session_token);
      router.push("/aura8/compliance-review");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060608] p-6 font-mono">
      <div className="w-full max-w-[420px] rounded-lg border border-[#FF006E40] bg-[#0D0D0F] p-10">
        <div className="mb-6 text-[10px] uppercase tracking-[0.2em] text-[#FF006E]">
          AURA8 — COMPLIANCE ACCESS
        </div>

        <div className="mb-8 text-xl font-extrabold text-white">
          Compliance Review Login
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-[#EF444430] p-3 text-[13px] text-[#EF4444]">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleLogin()}
          disabled={loading}
          className="mb-3 w-full rounded-md border border-[#3F3F46] bg-[#1A1A1D] p-3 text-sm text-white opacity-100 outline-none disabled:opacity-60"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleLogin()}
          disabled={loading}
          className="mb-6 w-full rounded-md border border-[#3F3F46] bg-[#1A1A1D] p-3 text-sm text-white opacity-100 outline-none disabled:opacity-60"
        />

        <button
          onClick={handleLogin}
          disabled={loading || !username || !password}
          className="w-full rounded-md bg-[#FF006E] p-3 text-[13px] font-bold text-white transition-colors disabled:cursor-default disabled:bg-[#FF006E60]"
        >
          {loading ? "Authenticating..." : "Access Compliance Dashboard"}
        </button>

        <div className="mt-6 text-center text-[10px] leading-relaxed text-[#52525B]">
          Authorized Visa/Mastercard compliance personnel only.
          <br />
          Unauthorized access is prohibited.
          <br />
          All access is logged and audited.
        </div>
      </div>
    </div>
  );
}
