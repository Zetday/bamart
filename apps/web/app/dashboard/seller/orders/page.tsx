import DashboardSidebar from '@/components/DashboardSidebar';
import OrdersSellerClient from './DataTableClient';
import { cookies as getCookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface SellerOrderItem {
  itemId: number;
  sellerId: number;
  quantity: number;
  subtotal: number;
}

interface SellerOrder {
  id: number;
  userId: number;
  totalPrice: number;
  status: string;
  orderDate: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string | null;
  items: SellerOrderItem[];
}

export default async function SellerOrdersPage() {
  const cookieStore = await getCookies(); // ← TIDAK pakai await
  const token = cookieStore.get('token')?.value;
  const user = token ? verifyToken(token) : null;

  if (!user || user.role !== 'SELLER') redirect('/login');

  const authedUser = user!;
  const sellerId = authedUser.id;

  const apiBaseUrl = process.env.API_URL || 'http://localhost:8080';
  const ordersRes = await fetch(`${apiBaseUrl}/api/orders`, {
    headers: { Cookie: `token=${token}` },
    cache: 'no-store',
  });
  const ordersEnvelope = await ordersRes.json();
  const orders: SellerOrder[] = Array.isArray(ordersEnvelope.data)
    ? ordersEnvelope.data
    : Array.isArray(ordersEnvelope)
    ? ordersEnvelope
    : [];

  const sellerOrders = orders.filter((o) =>
    o.items && o.items.some((it) => it.sellerId === sellerId)
  );

  const rows = sellerOrders.map((o) => ({
    id: o.id,
    buyer: o.fullName,
    buyerId: o.userId,
    totalPrice: o.totalPrice,
    status: o.status,
    date: new Date(o.orderDate).toISOString(),

    fullName: o.fullName,
    phone: o.phone,
    address: o.address,
    city: o.city,
    postalCode: o.postalCode,
    notes: o.notes ?? '',
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <DashboardSidebar role="SELLER" userName={authedUser.name} userEmail={authedUser.email} />
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
        <OrdersSellerClient rows={rows} />
      </div>
    </div>
  );
}
