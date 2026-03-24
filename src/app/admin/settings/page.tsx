'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminSettingsPage() {
  const { authenticated, checking } = useAdminAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{ email: string; name: string } | null>(null);
  const [storeConfig, setStoreConfig] = useState<{ stripeConfigured: boolean; blobConfigured: boolean; databaseUrl: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then(d => { if (d.email) setAdminInfo(d); }).catch(() => {});
    fetch('/api/admin/settings').then(r => r.json()).then(d => setStoreConfig(d)).catch(() => {});
  }, []);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setMessage('');
    if (newPassword !== confirmPassword) { setError('New passwords do not match'); return; }
    if (newPassword.length < 6) { setError('New password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) });
      const data = await res.json();
      if (res.ok) { setMessage('Password changed successfully'); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }
      else { setError(data.error || 'Failed to change password'); }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }

  if (checking || !authenticated) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>
        <div className="max-w-2xl space-y-8">

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Store Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Store Name</span><span className="text-gray-900 font-medium">Digital Downloads Store</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tagline</span><span className="text-gray-900 font-medium">Premium digital products</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Currency</span><span className="text-gray-900 font-medium">USD</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Integrations</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💳</span>
                  <div><p className="font-medium text-gray-900">Stripe Payments</p><p className="text-xs text-gray-500">Accept credit card payments</p></div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${storeConfig?.stripeConfigured ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {storeConfig?.stripeConfigured ? '✅ Connected' : '❌ Not configured'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">☁️</span>
                  <div><p className="font-medium text-gray-900">Blob Storage</p><p className="text-xs text-gray-500">File uploads for products</p></div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${storeConfig?.blobConfigured ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {storeConfig?.blobConfigured ? '✅ Connected' : '❌ Not configured'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🗄️</span>
                  <div><p className="font-medium text-gray-900">Database</p><p className="text-xs text-gray-500">Turso / libSQL</p></div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${storeConfig?.databaseUrl === 'configured' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {storeConfig?.databaseUrl === 'configured' ? '✅ Connected' : '❌ Not configured'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Payment Methods</h2>
            <div className="space-y-3">
              {[
                { icon: '💳', label: 'Credit / Debit Cards', detail: storeConfig?.stripeConfigured ? 'Enabled' : 'Disabled' },
                { icon: '🍎', label: 'Apple Pay', detail: storeConfig?.stripeConfigured ? 'Via Stripe' : 'Disabled' },
                { icon: '🔵', label: 'Google Pay', detail: storeConfig?.stripeConfigured ? 'Via Stripe' : 'Disabled' },
              ].map((pm) => (
                <div key={pm.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="text-lg">{pm.icon}</span><span className="text-sm text-gray-900">{pm.label}</span></div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${storeConfig?.stripeConfigured ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{pm.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {adminInfo && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Account Information</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-gray-900 font-medium">{adminInfo.email}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="text-gray-900 font-medium">{adminInfo.name}</span></div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900" />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900" />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900" />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {message && <p className="text-green-600 text-sm">{message}</p>}
              <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50">{loading ? 'Changing...' : 'Change Password'}</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
