'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/setup')
      .then((res) => res.json())
      .then((data) => {
        if (data.setupRequired) {
          setSetupMode(true);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (res.ok) {
        const loginRes = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, rememberMe: true }),
        });

        if (loginRes.ok) {
          router.push('/admin');
          router.refresh();
        } else {
          setSetupMode(false);
          setError('Account created! Please sign in.');
        }
      } else if (res.status === 403) {
        setSetupMode(false);
        setError('Setup already completed. Please sign in.');
      } else {
        setError(data.error || 'Setup failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center gradient-mesh"
        style={{ backgroundColor: '#0A0A0F' }}
      >
        <div className="shimmer w-32 h-4 rounded" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center gradient-mesh p-4"
      style={{ backgroundColor: '#0A0A0F' }}
    >
      <div className="glass p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            {setupMode ? 'Admin Setup' : 'Admin Login'}
          </h1>
          <p className="text-text-secondary mt-2 text-sm">
            {setupMode
              ? 'Create your admin account to get started'
              : 'Sign in to your admin account'}
          </p>
        </div>

        <form
          onSubmit={setupMode ? handleSetup : handleLogin}
          className="space-y-4"
        >
          {setupMode && (
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-text-secondary mb-1.5"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="glass-input w-full px-4 py-3 rounded-xl text-sm"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text-secondary mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                setupMode ? 'your@email.com' : 'admin@store.local'
              }
              required
              autoFocus
              className="glass-input w-full px-4 py-3 rounded-xl text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-secondary mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                setupMode ? 'Min 8 characters' : 'Enter your password'
              }
              required
              minLength={setupMode ? 8 : undefined}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm"
            />
          </div>

          {!setupMode && (
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/[0.05]"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 text-sm text-text-secondary"
              >
                Remember me for 30 days
              </label>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full px-6 py-3 rounded-xl font-medium text-sm disabled:opacity-50"
          >
            {loading
              ? setupMode
                ? 'Creating account...'
                : 'Signing in...'
              : setupMode
                ? 'Create Admin Account'
                : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
