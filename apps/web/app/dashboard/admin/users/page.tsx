import prisma from '@/lib/prisma';
import DashboardSidebar from '@/components/DashboardSidebar';
import DataTableClient from './DataTableClient';

export default async function UsersPage() {
  const users = await prisma.user.findMany();

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
  }));

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar role="ADMIN" />

      <div className="flex-1 p-6">
        <DataTableClient rows={rows} />
      </div>
    </div>
  );
}
