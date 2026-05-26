import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import DashboardSidebar from '@/components/DashboardSidebar';
import AdminDashboardContent from '@/components/AdminDashboardContent';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) redirect('/login');

  const user = verifyToken(token);
  if (!user) redirect('/login');

  return (
    <div className="flex min-h-screen bg-slate-950">
      <DashboardSidebar
        role="ADMIN"
        userName={user.name}
        userEmail={user.email}
      />
      <AdminDashboardContent />
    </div>
  );
}
