import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();

  if (!authed) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0A0A0F' }}>
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-auto">{children}</main>
    </div>
  );
}
