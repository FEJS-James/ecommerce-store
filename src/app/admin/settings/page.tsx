'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  Settings,
  CreditCard,
  Database,
  HardDrive,
  Store,
  Lock,
  Wallet,
  Smartphone,
  Wrench,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

function ConnectionDot({ connected }: { connected: boolean }) {
  return (
    <div
      className={`w-2 h-2 rounded-full flex-shrink-0 ${
        connected ? 'bg-emerald-400' : 'bg-red-400'
      }`}
      style={{
        boxShadow: connected
          ? '0 0 8px rgba(52, 211, 153, 0.5)'
          : '0 0 8px rgba(248, 113, 113, 0.5)',
      }}
    />
  );
}

export default function AdminSettingsPage() {
  const { authenticated, checking } = useAdminAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{
    email: string;
    name: string;
  } | null>(null);
  const [storeConfig, setStoreConfig] = useState<{
    stripeConfigured: boolean;
    blobConfigured: boolean;
    databaseUrl: string;
  } | null>(null);
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.email) setAdminInfo(d);
      })
      .catch(() => {});
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => setStoreConfig(d))
      .catch(() => {});
  }, []);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRunMigration() {
    setMigrationLoading(true);
    setMigrationResult(null);
    try {
      const res = await fetch('/api/admin/migrate/product-type', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setMigrationResult({
          type: 'success',
          message: data.message || 'Migration completed successfully.',
        });
      } else {
        setMigrationResult({
          type: 'error',
          message: data.error || 'Migration failed.',
        });
      }
    } catch {
      setMigrationResult({
        type: 'error',
        message: 'Network error. Please try again.',
      });
    } finally {
      setMigrationLoading(false);
    }
  }

  if (checking || !authenticated)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0A0A0F' }}
      >
        <div className="shimmer w-32 h-4 rounded" />
      </div>
    );

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0A0A0F' }}>
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-6 h-6 text-indigo-400" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* Store Information */}
          <div className="glass p-6">
            <div className="flex items-center gap-2 mb-5">
              <Store className="w-5 h-5 text-indigo-400" aria-hidden="true" />
              <h2 className="font-semibold text-text-primary">
                Store Information
              </h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-white/[0.05]">
                <span className="text-text-secondary">Store Name</span>
                <span className="text-text-primary font-medium">
                  AI Armory
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/[0.05]">
                <span className="text-text-secondary">Tagline</span>
                <span className="text-text-primary font-medium">
                  Premium digital products
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-text-secondary">Currency</span>
                <span className="text-text-primary font-medium">USD</span>
              </div>
            </div>
          </div>

          {/* Integrations */}
          <div className="glass p-6">
            <div className="flex items-center gap-2 mb-5">
              <Database
                className="w-5 h-5 text-indigo-400"
                aria-hidden="true"
              />
              <h2 className="font-semibold text-text-primary">Integrations</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center">
                    <CreditCard
                      className="w-5 h-5 text-violet-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary text-sm">
                      Stripe Payments
                    </p>
                    <p className="text-xs text-text-secondary">
                      Accept credit card payments
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ConnectionDot
                    connected={storeConfig?.stripeConfigured ?? false}
                  />
                  <span
                    className={`text-xs font-medium ${
                      storeConfig?.stripeConfigured
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {storeConfig?.stripeConfigured
                      ? 'Connected'
                      : 'Not configured'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                    <HardDrive
                      className="w-5 h-5 text-cyan-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary text-sm">
                      Blob Storage
                    </p>
                    <p className="text-xs text-text-secondary">
                      File uploads for products
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ConnectionDot
                    connected={storeConfig?.blobConfigured ?? false}
                  />
                  <span
                    className={`text-xs font-medium ${
                      storeConfig?.blobConfigured
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {storeConfig?.blobConfigured
                      ? 'Connected'
                      : 'Not configured'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <Database
                      className="w-5 h-5 text-emerald-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary text-sm">
                      Database
                    </p>
                    <p className="text-xs text-text-secondary">
                      Turso / libSQL
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ConnectionDot
                    connected={storeConfig?.databaseUrl === 'configured'}
                  />
                  <span
                    className={`text-xs font-medium ${
                      storeConfig?.databaseUrl === 'configured'
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {storeConfig?.databaseUrl === 'configured'
                      ? 'Connected'
                      : 'Not configured'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Database Migrations */}
          <div className="glass p-6">
            <div className="flex items-center gap-2 mb-5">
              <Wrench
                className="w-5 h-5 text-indigo-400"
                aria-hidden="true"
              />
              <h2 className="font-semibold text-text-primary">
                Database Migrations
              </h2>
            </div>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary text-sm">
                      Product Type Migration
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Adds product_type column and populates it based on
                      category
                    </p>
                  </div>
                  <button
                    onClick={handleRunMigration}
                    disabled={migrationLoading}
                    className="btn-gradient px-4 py-2 rounded-xl font-medium text-sm disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
                  >
                    {migrationLoading ? (
                      <>
                        <Loader2
                          className="w-4 h-4 animate-spin"
                          aria-hidden="true"
                        />
                        Running…
                      </>
                    ) : (
                      'Run Migration'
                    )}
                  </button>
                </div>
                {migrationResult && (
                  <div
                    className={`mt-3 flex items-start gap-2 text-sm p-3 rounded-lg ${
                      migrationResult.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {migrationResult.type === 'success' ? (
                      <CheckCircle2
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <XCircle
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span>{migrationResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="glass p-6">
            <div className="flex items-center gap-2 mb-5">
              <Wallet
                className="w-5 h-5 text-indigo-400"
                aria-hidden="true"
              />
              <h2 className="font-semibold text-text-primary">
                Payment Methods
              </h2>
            </div>
            <div className="space-y-3">
              {[
                {
                  Icon: CreditCard,
                  label: 'Credit / Debit Cards',
                  detail: storeConfig?.stripeConfigured
                    ? 'Enabled'
                    : 'Disabled',
                  active: storeConfig?.stripeConfigured ?? false,
                },
                {
                  Icon: Smartphone,
                  label: 'Apple Pay',
                  detail: storeConfig?.stripeConfigured
                    ? 'Via Stripe'
                    : 'Disabled',
                  active: storeConfig?.stripeConfigured ?? false,
                },
                {
                  Icon: Wallet,
                  label: 'Google Pay',
                  detail: storeConfig?.stripeConfigured
                    ? 'Via Stripe'
                    : 'Disabled',
                  active: storeConfig?.stripeConfigured ?? false,
                },
              ].map((pm) => (
                <div
                  key={pm.label}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <pm.Icon
                      className="w-4 h-4 text-text-secondary"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-text-primary">
                      {pm.label}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      pm.active
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-white/[0.08] text-text-secondary'
                    }`}
                  >
                    {pm.detail}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Account Info */}
          {adminInfo && (
            <div className="glass p-6">
              <div className="flex items-center gap-2 mb-5">
                <Lock
                  className="w-5 h-5 text-indigo-400"
                  aria-hidden="true"
                />
                <h2 className="font-semibold text-text-primary">
                  Account Information
                </h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-white/[0.05]">
                  <span className="text-text-secondary">Email</span>
                  <span className="text-text-primary font-medium">
                    {adminInfo.email}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-text-secondary">Name</span>
                  <span className="text-text-primary font-medium">
                    {adminInfo.name}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Change Password */}
          <div className="glass p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lock
                className="w-5 h-5 text-indigo-400"
                aria-hidden="true"
              />
              <h2 className="font-semibold text-text-primary">
                Change Password
              </h2>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-text-secondary mb-1.5"
                >
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-text-secondary mb-1.5"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-text-secondary mb-1.5"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              {message && (
                <p className="text-emerald-400 text-sm">{message}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn-gradient px-6 py-3 rounded-xl font-medium text-sm disabled:opacity-50"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
