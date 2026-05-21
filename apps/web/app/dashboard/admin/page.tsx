import DashboardSidebar from '@/components/DashboardSidebar';
import AdminDashboardContent from '@/components/AdminDashboardContent';

export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <DashboardSidebar role="ADMIN" />

      {/* Main content */}
      <AdminDashboardContent />
    </div>
  );
}
