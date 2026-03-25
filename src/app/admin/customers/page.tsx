'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Customer } from '@/lib/types';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Search, Users } from 'lucide-react';

export default function AdminCustomersPage() {
  const { authenticated, checking } = useAdminAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    const res = await fetch(`/api/admin/customers?${params}`);
    const data = await res.json();
    setCustomers(Array.isArray(data.customers) ? data.customers : []);
    setLoading(false);
  }, [debouncedSearch]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

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
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-indigo-400" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-text-primary">Customers</h1>
        </div>

        {/* Search */}
        <div className="glass p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[250px] relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-sm text-text-secondary hover:text-text-primary px-3 py-2 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="glass p-8 text-center">
            <div className="shimmer w-48 h-4 rounded mx-auto" />
          </div>
        ) : customers.length === 0 ? (
          <div className="glass p-8 text-center text-text-secondary">
            {searchQuery
              ? 'No customers match your search'
              : 'No customers yet'}
          </div>
        ) : (
          <div className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider hidden md:table-cell">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-indigo-400">
                              {(customer.name || customer.email)
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-text-primary">
                            {customer.name || '--'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-text-secondary">
                        {customer.email}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-text-primary">
                        {formatPrice(customer.total_spent_cents)}
                      </td>
                      <td className="px-4 py-4 text-sm text-text-secondary">
                        {customer.order_count}
                      </td>
                      <td className="px-4 py-4 text-sm text-text-secondary hidden md:table-cell">
                        {customer.first_purchase_at
                          ? formatDate(customer.first_purchase_at)
                          : '--'}
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
