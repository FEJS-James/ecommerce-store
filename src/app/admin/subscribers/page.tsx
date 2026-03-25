'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { formatDate } from '@/lib/utils';
import type { EmailSubscriber } from '@/lib/types';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Mail, Download } from 'lucide-react';

export default function AdminSubscribersPage() {
  const { authenticated, checking } = useAdminAuth();
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/subscribers')
      .then((res) => res.json())
      .then((data) => {
        setSubscribers(
          Array.isArray(data.subscribers) ? data.subscribers : []
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleExportCSV() {
    window.open('/api/admin/subscribers?format=csv', '_blank');
  }

  if (checking || !authenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0A0A0F' }}
      >
        <div className="shimmer w-32 h-4 rounded" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0A0A0F' }}>
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-indigo-400" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-text-primary">
              Subscribers
            </h1>
          </div>
          <button
            onClick={handleExportCSV}
            className="btn-ghost px-4 py-2.5 rounded-xl font-medium text-sm inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Export CSV
          </button>
        </div>

        {loading ? (
          <div className="glass p-8 text-center">
            <div className="shimmer w-48 h-4 rounded mx-auto" />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="glass p-8 text-center text-text-secondary">
            No subscribers yet
          </div>
        ) : (
          <div className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider hidden sm:table-cell">
                      Source
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider hidden md:table-cell">
                      Lead Magnet
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {subscribers.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-4 py-4 text-sm font-medium text-text-primary">
                        {sub.email}
                      </td>
                      <td className="px-4 py-4 text-sm text-text-secondary">
                        {sub.name || '--'}
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="text-xs bg-white/[0.08] text-text-secondary px-2.5 py-1 rounded-full">
                          {sub.source}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-text-secondary hidden md:table-cell">
                        {sub.lead_magnet || '--'}
                      </td>
                      <td className="px-4 py-4 text-sm text-text-secondary">
                        {formatDate(sub.subscribed_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
