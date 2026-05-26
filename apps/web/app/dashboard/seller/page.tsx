import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import DashboardSidebar from '@/components/DashboardSidebar';
import SellerDashboardContent from '@/components/SellerDashboardContent';
import { redirect } from 'next/navigation';

export default async function SellerDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) redirect('/login');

  const user = verifyToken(token);
  if (!user) redirect('/login');

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <DashboardSidebar
        role="SELLER"
        userName={user.name}
        userEmail={user.email}
      />
      <SellerDashboardContent />
    </div>
  );
}
