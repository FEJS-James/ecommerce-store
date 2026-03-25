'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Mail,
  Settings,
  Globe,
  LogOut,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

const navItems: { href: string; label: string; Icon: React.ComponentType<LucideProps> }[] = [
  { href: '/admin', label: 'Dashboard', Icon: BarChart3 },
  { href: '/admin/products', label: 'Products', Icon: Package },
  { href: '/admin/orders', label: 'Orders', Icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', Icon: Users },
  { href: '/admin/subscribers', label: 'Subscribers', Icon: Mail },
  { href: '/admin/settings', label: 'Settings', Icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col shrink-0">
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-xl">
          <Shield className="w-6 h-6 text-indigo-400" aria-hidden="true" />
          <span>AI Armory Admin</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <item.Icon className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <Globe className="w-5 h-5" aria-hidden="true" />
          <span className="font-medium">View Store</span>
        </Link>
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors w-full text-left"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
