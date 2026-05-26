import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import OrdersTableClient from './DataTableClient';
import DashboardSidebar from '@/components/DashboardSidebar';
import { redirect } from 'next/navigation';

interface AdminOrder {
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
}

export default async function AdminOrdersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');
  const user = verifyToken(token);
  if (!user) redirect('/login');

  const apiBaseUrl = process.env.API_URL || 'http://localhost:8080';
  const [ordersRes, buyersRes] = await Promise.all([
    fetch(`${apiBaseUrl}/api/orders`, {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store',
    }),
    fetch(`${apiBaseUrl}/api/users?role=BUYER`, {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store',
    }),
  ]);

  const ordersEnvelope = await ordersRes.json();
  const orders: AdminOrder[] = Array.isArray(ordersEnvelope.data)
    ? ordersEnvelope.data
    : Array.isArray(ordersEnvelope)
    ? ordersEnvelope
    : [];

  const buyersEnvelope = await buyersRes.json();
  const buyers = Array.isArray(buyersEnvelope.data)
    ? buyersEnvelope.data
    : Array.isArray(buyersEnvelope)
    ? buyersEnvelope
    : [];

  const rows = orders.map((o) => ({
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
    <div className="flex min-h-screen bg-slate-950">
      <DashboardSidebar role="ADMIN" userName={user.name} userEmail={user.email} />
      <div className="flex-1 bg-slate-50 p-6">
        <OrdersTableClient rows={rows} buyers={buyers} />
      </div>
    </div>
  );
}
