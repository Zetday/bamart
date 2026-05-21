import prisma from '@/lib/prisma';
import { cookies as getCookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import SellerItemsTableClient from './DataTableClient';
import DashboardSidebar from '@/components/DashboardSidebar';

export default async function SellerItemsPage() {
  const cookieStore = await getCookies(); // ← TIDAK pakai await
  const token = cookieStore.get('token')?.value;

  console.log('TOKEN:', token);

  if (!token) {
    return <div>Akses ditolak. (Token tidak ditemukan)</div>;
  }

  const payload = verifyToken(token);

  if (!payload) {
    return <div>Akses ditolak. (Token invalid)</div>;
  }

  if (payload.role !== 'SELLER') {
    return <div>Akses ditolak. (Bukan seller)</div>;
  }

  const sellerId = payload.id;

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  const items = await prisma.item.findMany({
    where: { userId: sellerId },
    include: { category: true, user: true },
    orderBy: { id: 'desc' },
  });

  const rows = items.map((i) => ({
    id: i.id,
    name: i.name,
    price: i.price,
    stock: i.stock,
    description: i.description ?? '',
    imageUrl: i.imageUrl,
    seller: i.user.name,
    category: i.category?.name ?? null,
    categoryId: i.categoryId,
    userId: i.userId,
  }));

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar role="SELLER" />
      <div className="flex-1 p-6">
        <SellerItemsTableClient
          rows={rows}
          sellerId={sellerId}
          categories={categories} // ← penting
        />
      </div>
    </div>
  );
}
