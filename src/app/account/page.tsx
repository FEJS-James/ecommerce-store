'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

interface OrderItem {
  id: string;
  product_name: string | null;
  product_slug: string | null;
  product_thumbnail_url: string | null;
  amount_cents: number;
  currency: string;
  status: string;
  download_token: string | null;
  download_count: number;
  max_downloads: number;
  token_expires_at: string | null;
  created_at: string;
}

interface DownloadItem {
  order_id: string;
  download_token: string;
  download_count: number;
  max_downloads: number;
  token_expires_at: string | null;
  order_created_at: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_thumbnail_url: string | null;
  file_url: string | null;
}

type Tab = 'orders' | 'downloads' | 'settings';

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function CustomerDashboard() {
  const { customer, checking } = useCustomerAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingDownloads, setLoadingDownloads] = useState(true);

  // Settings state
  const [settingsName, setSettingsName] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [settingsMsg, setSettingsMsg] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Fetch orders
  useEffect(() => {
    if (!customer) return;
    fetch('/api/account/orders')
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }, [customer]);

  // Fetch downloads
  useEffect(() => {
    if (!customer) return;
    fetch('/api/account/downloads')
      .then((res) => res.json())
      .then((data) => setDownloads(data.downloads || []))
      .catch(() => {})
      .finally(() => setLoadingDownloads(false));
  }, [customer]);

  // Populate settings fields when customer loads
  useEffect(() => {
    if (customer) {
      setSettingsName(customer.name || '');
      setSettingsEmail(customer.email || '');
    }
  }, [customer]);

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMsg('');
    setSettingsError('');
    try {
      const res = await fetch('/api/account/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_name', name: settingsName }),
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsMsg('Name updated successfully');
      } else {
        setSettingsError(data.error || 'Failed to update name');
      }
    } catch {
      setSettingsError('Network error');
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMsg('');
    setSettingsError('');
    try {
      const res = await fetch('/api/account/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_email', email: settingsEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsMsg('Email updated successfully');
      } else {
        setSettingsError(data.error || 'Failed to update email');
      }
    } catch {
      setSettingsError('Network error');
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMsg('');
    setSettingsError('');

    if (newPassword !== confirmNewPassword) {
      setSettingsError('Passwords do not match');
      setSettingsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/account/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_password', currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsMsg('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setSettingsError(data.error || 'Failed to update password');
      }
    } catch {
      setSettingsError('Network error');
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/account/logout', { method: 'POST' });
    router.push('/account/login');
    router.refresh();
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-8 w-48 bg-gray-200 rounded mx-auto" />
          <div className="h-4 w-32 bg-gray-200 rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!customer) return null;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'downloads', label: 'Downloads', icon: '⬇️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl">🛡️</Link>
            <div>
              <h1 className="text-xl font-bold">My Account</h1>
              <p className="text-gray-400 text-sm">{customer.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="text-sm text-gray-300 hover:text-white transition-colors hidden sm:block"
            >
              Browse Products
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-200 rounded-lg p-1 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSettingsMsg('');
                setSettingsError('');
              }}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Purchase History</h2>
            {loadingOrders ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <span className="text-4xl block mb-4">🛒</span>
                <p className="text-gray-500 mb-4">No orders yet</p>
                <Link
                  href="/products"
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {order.product_thumbnail_url && (
                          <img
                            src={order.product_thumbnail_url}
                            alt=""
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {order.product_name || 'Digital Product'}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(order.created_at)} · {formatPrice(order.amount_cents)}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 text-xs mt-2 px-2 py-0.5 rounded-full ${
                              order.status === 'completed'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-yellow-50 text-yellow-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                order.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                              }`}
                            />
                            {order.status === 'completed' ? 'Completed' : order.status}
                          </span>
                        </div>
                      </div>
                      {order.download_token && order.download_count < order.max_downloads && (
                        <a
                          href={`/api/download/${order.download_token}`}
                          className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          ⬇️ Download
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Downloads Tab */}
        {activeTab === 'downloads' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Download Library</h2>
            {loadingDownloads ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : downloads.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <span className="text-4xl block mb-4">📂</span>
                <p className="text-gray-500 mb-4">No downloads available</p>
                <Link
                  href="/products"
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {downloads.map((dl) => {
                  const expired = dl.token_expires_at && new Date(dl.token_expires_at) < new Date();
                  const limitReached = dl.download_count >= dl.max_downloads;
                  const canDownload = !expired && !limitReached && dl.file_url;

                  return (
                    <div key={dl.order_id} className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          {dl.product_thumbnail_url && (
                            <img
                              src={dl.product_thumbnail_url}
                              alt=""
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">{dl.product_name}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Purchased {formatDate(dl.order_created_at)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Downloads: {dl.download_count} / {dl.max_downloads}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {canDownload ? (
                            <a
                              href={`/api/download/${dl.download_token}`}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              ⬇️ Download
                            </a>
                          ) : !dl.file_url ? (
                            <span className="text-sm text-gray-400">File not available yet</span>
                          ) : expired ? (
                            <span className="text-sm text-red-500">Link expired</span>
                          ) : (
                            <span className="text-sm text-red-500">Download limit reached</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>

            {settingsMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-sm">
                {settingsMsg}
              </div>
            )}
            {settingsError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
                {settingsError}
              </div>
            )}

            {/* Update Name */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Name</h3>
              <form onSubmit={handleUpdateName} className="flex gap-3">
                <input
                  type="text"
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                  placeholder="Your name"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
                />
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Save
                </button>
              </form>
            </div>

            {/* Update Email */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Email</h3>
              <form onSubmit={handleUpdateEmail} className="flex gap-3">
                <input
                  type="email"
                  value={settingsEmail}
                  onChange={(e) => setSettingsEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
                />
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Save
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Change Password</h3>
              <form onSubmit={handleUpdatePassword} className="space-y-3">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (at least 8 characters)"
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
                />
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
                />
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
