'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Customer } from '@/lib/types';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminCustomersPage() {
  const { authenticated, checking } = useAdminAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/customers')
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data.customers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (checking || !authenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Customers</h1>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">No customers yet</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Orders</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">First Purchase</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Last Purchase</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.name || '—'}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatPrice(customer.total_spent_cents)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.order_count}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {customer.first_purchase_at ? formatDate(customer.first_purchase_at) : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {customer.last_purchase_at ? formatDate(customer.last_purchase_at) : '—'}
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
