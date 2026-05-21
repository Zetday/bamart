import prisma from '@/lib/prisma';
import DashboardSidebar from '@/components/DashboardSidebar';
import DataTableClient from './DataTableClient';

export default async function AdminItemsPage() {
  // Ambil seluruh produk + seller + kategori
  const items = await prisma.item.findMany({
    include: {
      user: true,
      category: true,
    },
  });

  // Ambil seluruh user untuk dropdown seller
  const users = await prisma.user.findMany({
    select: { id: true, name: true, role: true },
  });

  // Ambil seluruh kategori untuk dropdown kategori
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
  });

  // Bentuk data baris tabel
  const rows = items.map((i) => ({
    id: i.id,
    name: i.name,
    price: i.price,
    stock: i.stock,
    description: i.description,
    imageUrl: i.imageUrl,
    seller: i.user.name,
    userId: i.userId, // ⭐ FIX UTAMA
    category: i.category?.name ?? null,
    categoryId: i.categoryId ?? null,
  }));

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar role="ADMIN" />
      <div className="flex-1 p-6">
        <DataTableClient rows={rows} users={users} categories={categories} />
      </div>
    </div>
  );
}
