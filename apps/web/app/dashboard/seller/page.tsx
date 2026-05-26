import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import DashboardSidebar from '@/components/DashboardSidebar';
import SellerDashboardContent from '@/components/SellerDashboardContent';

export default async function SellerItemsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return <div>Unauthorized</div>;

  const user = verifyToken(token);
  if (!user) return <div>Unauthorized</div>;


  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR SELLER */}
      <DashboardSidebar role="SELLER" />

      {/* CONTENT */}
      <div className="flex-1 p-6">
        <SellerDashboardContent />
      </div>
    </div>
  );
}
