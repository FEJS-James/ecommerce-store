'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Shield,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Mail,
  Settings,
  Globe,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

const navItems: { href: string; label: string; Icon: React.ComponentType<LucideProps> }[] = [
  { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', Icon: Package },
  { href: '/admin/orders', label: 'Orders', Icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', Icon: Users },
  { href: '/admin/subscribers', label: 'Subscribers', Icon: Mail },
  { href: '/admin/settings', label: 'Settings', Icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.email) setAdminInfo(d);
      })
      .catch(() => {});
  }, []);

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } glass min-h-screen flex flex-col shrink-0 transition-all duration-300 rounded-none border-r border-t-0 border-b-0 border-l-0`}
      style={{ borderRadius: 0 }}
    >
      {/* Logo */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-text-primary truncate">
              AI Armory
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors flex-shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/10 text-text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.05]'
              }`}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-indigo-500 to-violet-500"
                  style={{
                    boxShadow: '0 0 12px rgba(99, 102, 241, 0.6)',
                  }}
                />
              )}
              <item.Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? 'text-indigo-400' : ''
                }`}
                aria-hidden="true"
              />
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-white/[0.08] space-y-1">
        {/* User info */}
        {adminInfo && !collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-text-primary truncate">
              {adminInfo.name}
            </p>
            <p className="text-xs text-text-secondary truncate">
              {adminInfo.email}
            </p>
          </div>
        )}

        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors"
          title={collapsed ? 'View Store' : undefined}
        >
          <Globe className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          {!collapsed && <span className="font-medium text-sm">View Store</span>}
        </Link>

        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors w-full text-left"
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            {!collapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
