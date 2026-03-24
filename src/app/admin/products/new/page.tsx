'use client';

import AdminSidebar from '@/components/AdminSidebar';
import ProductForm from '@/components/ProductForm';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Link from 'next/link';

export default function NewProductPage() {
  const { authenticated, checking } = useAdminAuth();

  if (checking || !authenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-auto">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/admin/products" className="hover:text-gray-700">Products</Link>
          <span>/</span>
          <span className="text-gray-900">New Product</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Product</h1>
        <ProductForm />
      </main>
    </div>
  );
}
