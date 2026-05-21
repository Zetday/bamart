import prisma from '@/lib/prisma';
import DashboardSidebar from '@/components/DashboardSidebar';
import OrdersSellerClient from './DataTableClient';
import { cookies as getCookies} from 'next/headers';
import { verifyToken } from '@/lib/auth';

export default async function SellerOrdersPage() {
  const cookieStore = await getCookies(); // ← TIDAK pakai await
  const token = cookieStore.get('token')?.value;
  const user = token ? verifyToken(token) : null;

  if (!user || user.role !== 'SELLER') {
    return <div>Akses ditolak</div>;
  }

  const sellerId = user.id;

  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          item: { userId: sellerId },
        },
      },
    },
    include: {
      user: true,
      items: { include: { item: true } },
    },
    orderBy: { id: 'desc' },
  });

  const rows = orders.map((o) => ({
    id: o.id,
    buyer: o.user.name,
    buyerId: o.userId,
    totalPrice: o.totalPrice,
    status: o.status,
    date: o.orderDate.toISOString(),

    fullName: o.fullName,
    phone: o.phone,
    address: o.address,
    city: o.city,
    postalCode: o.postalCode,
    notes: o.notes ?? '',
  }));

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar role="SELLER" />
      <div className="flex-1 p-6">
        <OrdersSellerClient rows={rows} />
      </div>
    </div>
  );
}
