'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ComplianceLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/compliance-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || 'Login failed');
        return;
      }

      // Store session token
      localStorage.setItem('compliance_session_token', data.session_token);
      
      // Redirect to compliance review
      router.push('/aura8/compliance-review');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#060608',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'DM Mono, monospace',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#0D0D0F',
          border: '1px solid #FF006E40',
          borderRadius: '8px',
          padding: '40px',
          maxWidth: '420px',
          width: '100%',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            color: '#FF006E',
            letterSpacing: '0.2em',
            marginBottom: '24px',
          }}
        >
          AURA8 — COMPLIANCE ACCESS
        </div>

        <div
          style={{
            fontSize: '20px',
            fontWeight: 800,
            color: '#FFF',
            marginBottom: '32px',
          }}
        >
          Compliance Review Login
        </div>

        {error && (
          <div
            style={{
              background: '#EF444430',
              color: '#EF4444',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              background: '#1A1A1D',
              border: '1px solid #3F3F46',
              borderRadius: '6px',
              color: '#FFF',
              marginBottom: '12px',
              fontFamily: 'DM Mono, monospace',
              boxSizing: 'border-box',
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              background: '#1A1A1D',
              border: '1px solid #3F3F46',
              borderRadius: '6px',
              color: '#FFF',
              marginBottom: '24px',
              fontFamily: 'DM Mono, monospace',
              boxSizing: 'border-box',
            }}
          />

          <button
            type="submit"
            disabled={loading || !username || !password}
            style={{
              width: '100%',
              padding: '12px',
              background: '#FF006E',
              border: 'none',
              borderRadius: '6px',
              color: '#FFF',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Logging in...' : 'Access Compliance Dashboard'}
          </button>
        </form>

        <div
          style={{
            fontSize: '10px',
            color: '#52525B',
            marginTop: '24px',
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
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
