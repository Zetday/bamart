import prisma from '@/lib/prisma';
import OrdersTableClient from './DataTableClient';
import DashboardSidebar from '@/components/DashboardSidebar';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
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

  const buyers = await prisma.user.findMany({
    where: { role: 'BUYER' },
    select: { id: true, name: true },
  });

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar role="ADMIN" />
      <div className="flex-1 p-6">
        <OrdersTableClient rows={rows} buyers={buyers} />
      </div>
    </div>
  );
}
