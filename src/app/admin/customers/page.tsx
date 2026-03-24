'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Customer } from '@/lib/types';
import { useAdminAuth } from '@/hooks/useAdminAuth';

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

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  if (checking || !authenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Customers</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[250px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Search by name or email</label>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search customers..." className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">Clear</button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">{searchQuery ? 'No customers match your search' : 'No customers yet'}</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Orders</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">First Purchase</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Last Purchase</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{customer.email}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{customer.name || '—'}</td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatPrice(customer.total_spent_cents)}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{customer.order_count}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 hidden md:table-cell">{customer.first_purchase_at ? formatDate(customer.first_purchase_at) : '—'}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 hidden md:table-cell">{customer.last_purchase_at ? formatDate(customer.last_purchase_at) : '—'}</td>
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
