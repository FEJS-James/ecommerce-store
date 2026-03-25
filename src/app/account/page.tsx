"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import {
  Shield,
  Package,
  Download,
  Settings,
  ShoppingCart,
  FolderOpen,
  LogOut,
} from "lucide-react";

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

type Tab = "orders" | "downloads" | "settings";

function formatPrice(cents: number): string {
  return `$${(Number(cents) / 100).toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  return new Date(
    dateStr.endsWith("Z") ? dateStr : dateStr + "Z",
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CustomerDashboard() {
  const { customer, checking } = useCustomerAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingDownloads, setLoadingDownloads] = useState(true);

  // Settings state
  const [settingsName, setSettingsName] = useState("");
  const [settingsEmail, setSettingsEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [settingsMsg, setSettingsMsg] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    if (!customer) return;
    fetch("/api/account/orders")
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data.orders) ? data.orders : []))
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }, [customer]);

  useEffect(() => {
    if (!customer) return;
    fetch("/api/account/downloads")
      .then((res) => res.json())
      .then((data) =>
        setDownloads(Array.isArray(data.downloads) ? data.downloads : []),
      )
      .catch(() => {})
      .finally(() => setLoadingDownloads(false));
  }, [customer]);

  useEffect(() => {
    if (customer) {
      setSettingsName(customer.name || "");
      setSettingsEmail(customer.email || "");
    }
  }, [customer]);

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMsg("");
    setSettingsError("");
    try {
      const res = await fetch("/api/account/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_name", name: settingsName }),
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsMsg("Name updated successfully");
      } else {
        setSettingsError(data.error || "Failed to update name");
      }
    } catch {
      setSettingsError("Network error");
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMsg("");
    setSettingsError("");
    try {
      const res = await fetch("/api/account/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_email", email: settingsEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsMsg("Email updated successfully");
      } else {
        setSettingsError(data.error || "Failed to update email");
      }
    } catch {
      setSettingsError("Network error");
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMsg("");
    setSettingsError("");

    if (newPassword !== confirmNewPassword) {
      setSettingsError("Passwords do not match");
      setSettingsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/account/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_password",
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsMsg("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setSettingsError(data.error || "Failed to update password");
      }
    } catch {
      setSettingsError("Network error");
    } finally {
      setSettingsLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/account/logout", { method: "POST" });
    router.push("/account/login");
    router.refresh();
  }

  if (checking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0A0A0F" }}
      >
        <div className="space-y-4 text-center">
          <div className="h-8 w-48 shimmer rounded mx-auto" />
          <div className="h-4 w-32 shimmer rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!customer) return null;

  const tabs: {
    id: Tab;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "orders", label: "Orders", Icon: Package },
    { id: "downloads", label: "Downloads", Icon: Download },
    { id: "settings", label: "Settings", Icon: Settings },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0F" }}>
      {/* Header */}
      <div
        className="border-b border-white/[0.06]"
        style={{ background: "rgba(255, 255, 255, 0.02)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Shield className="w-7 h-7 text-indigo-400" aria-hidden="true" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">My Account</h1>
              <p className="text-zinc-500 text-sm">{customer.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block"
            >
              Browse Products
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 glass rounded-xl p-1 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSettingsMsg("");
                setSettingsError("");
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 focus-glow ${
                activeTab === tab.id
                  ? "bg-white/[0.1] text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <tab.Icon className="w-4 h-4" aria-hidden="true" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              Purchase History
            </h2>
            {loadingOrders ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass rounded-2xl p-6">
                    <div className="h-4 shimmer rounded w-1/3 mb-2" />
                    <div className="h-4 shimmer rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <ShoppingCart
                  className="w-10 h-10 text-zinc-600 mx-auto mb-4"
                  aria-hidden="true"
                />
                <p className="text-zinc-500 mb-4">No orders yet</p>
                <Link
                  href="/products"
                  className="inline-block btn-gradient px-6 py-3 rounded-lg font-medium focus-glow"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="glass rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {order.product_thumbnail_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={order.product_thumbnail_url}
                            alt=""
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-white">
                            {order.product_name || "Digital Product"}
                          </h3>
                          <p className="text-sm text-zinc-500 mt-1">
                            {formatDate(order.created_at)} ·{" "}
                            {formatPrice(order.amount_cents)}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 text-xs mt-2 px-2 py-0.5 rounded-full ${
                              order.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-amber-500/10 text-amber-400"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                order.status === "completed"
                                  ? "bg-emerald-400"
                                  : "bg-amber-400"
                              }`}
                            />
                            {order.status === "completed"
                              ? "Completed"
                              : order.status}
                          </span>
                        </div>
                      </div>
                      {order.download_token &&
                        order.download_count < order.max_downloads && (
                          <a
                            href={`/api/download/${order.download_token}`}
                            className="flex-shrink-0 btn-gradient px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 focus-glow"
                          >
                            <Download className="w-4 h-4" aria-hidden="true" />
                            Download
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
        {activeTab === "downloads" && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              Download Library
            </h2>
            {loadingDownloads ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="glass rounded-2xl p-6">
                    <div className="h-4 shimmer rounded w-1/3 mb-2" />
                    <div className="h-4 shimmer rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : downloads.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <FolderOpen
                  className="w-10 h-10 text-zinc-600 mx-auto mb-4"
                  aria-hidden="true"
                />
                <p className="text-zinc-500 mb-4">No downloads available</p>
                <Link
                  href="/products"
                  className="inline-block btn-gradient px-6 py-3 rounded-lg font-medium focus-glow"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {downloads.map((dl) => {
                  const expired =
                    dl.token_expires_at &&
                    new Date(String(dl.token_expires_at)) < new Date();
                  const limitReached = dl.download_count >= dl.max_downloads;
                  const canDownload = !expired && !limitReached && dl.file_url;

                  return (
                    <div key={dl.order_id} className="glass rounded-2xl p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          {dl.product_thumbnail_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={dl.product_thumbnail_url}
                              alt=""
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold text-white">
                              {dl.product_name}
                            </h3>
                            <p className="text-sm text-zinc-500 mt-1">
                              Purchased {formatDate(dl.order_created_at)}
                            </p>
                            <p className="text-xs text-zinc-600 mt-1">
                              Downloads: {dl.download_count} /{" "}
                              {dl.max_downloads}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {canDownload ? (
                            <a
                              href={`/api/download/${dl.download_token}`}
                              className="btn-gradient px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 focus-glow"
                            >
                              <Download
                                className="w-4 h-4"
                                aria-hidden="true"
                              />
                              Download
                            </a>
                          ) : !dl.file_url ? (
                            <span className="text-sm text-zinc-600">
                              File not available yet
                            </span>
                          ) : expired ? (
                            <span className="text-sm text-red-400">
                              Link expired
                            </span>
                          ) : (
                            <span className="text-sm text-red-400">
                              Download limit reached
                            </span>
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
        {activeTab === "settings" && (
          <div className="space-y-8">
            <h2 className="text-lg font-semibold text-white">
              Account Settings
            </h2>

            {settingsMsg && (
              <div className="glass p-4 rounded-xl text-sm border border-emerald-500/20 text-emerald-400">
                {settingsMsg}
              </div>
            )}
            {settingsError && (
              <div className="glass p-4 rounded-xl text-sm border border-red-500/20 text-red-400">
                {settingsError}
              </div>
            )}

            {/* Update Name */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-medium text-white mb-4">Name</h3>
              <form onSubmit={handleUpdateName} className="flex gap-3">
                <input
                  type="text"
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                  placeholder="Your name"
                  className="flex-1 px-4 py-2.5 rounded-lg glass-input text-sm"
                />
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="btn-gradient px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 focus-glow"
                >
                  Save
                </button>
              </form>
            </div>

            {/* Update Email */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-medium text-white mb-4">Email</h3>
              <form onSubmit={handleUpdateEmail} className="flex gap-3">
                <input
                  type="email"
                  value={settingsEmail}
                  onChange={(e) => setSettingsEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="flex-1 px-4 py-2.5 rounded-lg glass-input text-sm"
                />
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="btn-gradient px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 focus-glow"
                >
                  Save
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-medium text-white mb-4">Change Password</h3>
              <form onSubmit={handleUpdatePassword} className="space-y-3">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  required
                  className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (at least 8 characters)"
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
                />
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
                />
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="btn-gradient px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 focus-glow"
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
