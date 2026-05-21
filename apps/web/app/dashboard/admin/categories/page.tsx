import prisma from '@/lib/prisma';
import DashboardSidebar from '@/components/DashboardSidebar';
import DataTableClient from './DataTableClient';

export default async function AdminCategoriesPage() {
  // Ambil seluruh kategori
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true, // ← WAJIB DITAMBAHKAN
    },
  });

  // Ubah menjadi rows untuk DataTable
  const rows = categories.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description ?? '',
  }));

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar role="ADMIN" />

      <main className="flex-1 p-6">
        <DataTableClient rows={rows} />
      </main>
    </div>
  );
}
