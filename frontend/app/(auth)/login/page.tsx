'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken, getToken } from '@/lib/api';

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleScriptReady, setGoogleScriptReady] = useState(false);

  // If a session already exists (e.g. user hit back/refresh onto /login),
  // don't let them silently spin up a brand-new empty guest workspace —
  // send them back to their existing one instead.
  useEffect(() => {
    if (getToken()) {
      router.replace('/tasks');
    }
  }, [router]);

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

  // Fired by Google's script once the user picks an account. `response.credential`
  // is a signed ID token — we hand it straight to the backend, which verifies it.
  async function handleGoogleCredential(response: { credential: string }) {
    setLoading(true);
    setError(null);
    try {
      const { accessToken } = await api.googleLogin(response.credential);
      setToken(accessToken);
      router.push('/tasks');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Loads Google's Identity Services script once on mount.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleScriptReady(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Once the script has loaded, initialize it and render the official
  // button into the #google-btn container below.
  useEffect(() => {
    if (!googleScriptReady || !window.google || !GOOGLE_CLIENT_ID) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
    });

    window.google.accounts.id.renderButton(document.getElementById('google-btn'), {
      theme: 'outline',
      size: 'large',
      width: 320,
      text: 'continue_with',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleScriptReady]);

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

        {/* Google renders its own button into this container once its
            script loads — see the useEffect above. */}
        <div id="google-btn" className="mt-3 flex justify-center" />

        {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}

        <p className="mt-4 text-center text-xs text-foreground-muted">
          By clicking continue, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </main>
  );
}