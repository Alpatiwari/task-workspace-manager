'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGuestLogin() {
    setLoading(true);
    setError(null);
    try {
      const { accessToken } = await api.guestLogin();
      setToken(accessToken);
      router.push('/tasks');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-muted">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-center text-lg font-semibold">Let's get back on track</h1>
        <p className="mt-1 text-center text-sm text-foreground-muted">
          Enter your email below to login to your account
        </p>

        <button
          onClick={handleGuestLogin}
          disabled={loading}
          className="mt-6 w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Continue as Guest'}
        </button>

        <button
          disabled
          title="Wire up GOOGLE_CLIENT_ID/SECRET in backend/.env to enable"
          className="mt-2 w-full rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground-muted transition hover:bg-surface-muted disabled:opacity-60"
        >
          Login with Google
        </button>

        {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}

        <p className="mt-4 text-center text-xs text-foreground-muted">
          By clicking continue, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </main>
  );
}
