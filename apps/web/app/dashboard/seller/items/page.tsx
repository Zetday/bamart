import { cookies as getCookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import SellerItemsTableClient from './DataTableClient';
import DashboardSidebar from '@/components/DashboardSidebar';
import { redirect } from 'next/navigation';

interface SellerItem {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string | null;
  imageUrl: string | null;
  seller: string;
  userId: number;
  category: string | null;
  categoryId: number | null;
}

export default async function SellerItemsPage() {
  const cookieStore = await getCookies(); // ← TIDAK pakai await
  const token = cookieStore.get('token')?.value;

  console.log('TOKEN:', token);

  if (!token) redirect('/login');

  const payload = verifyToken(token);

  if (!payload) redirect('/login');

  if (payload.role !== 'SELLER') redirect('/dashboard/admin');

  const sellerId = payload.id;

  const apiBaseUrl = process.env.API_URL || 'http://localhost:8080';
  const [categoriesRes, itemsRes] = await Promise.all([
    fetch(`${apiBaseUrl}/api/categories`, { cache: 'no-store' }),
    fetch(`${apiBaseUrl}/api/items`, { cache: 'no-store' }),
  ]);

  const categoriesEnvelope = await categoriesRes.json();
  const categories = Array.isArray(categoriesEnvelope.data)
    ? categoriesEnvelope.data
    : Array.isArray(categoriesEnvelope)
    ? categoriesEnvelope
    : [];

  const itemsEnvelope = await itemsRes.json();
  const items: SellerItem[] = Array.isArray(itemsEnvelope.data)
    ? itemsEnvelope.data
    : Array.isArray(itemsEnvelope)
    ? itemsEnvelope
    : [];

  const sellerItems = items.filter((i) => i.userId === sellerId);

  const rows = sellerItems.map((i) => ({
    id: i.id,
    name: i.name,
    price: i.price,
    stock: i.stock,
    description: i.description ?? '',
    imageUrl: i.imageUrl,
    seller: i.seller,
    category: i.category ?? null,
    categoryId: i.categoryId,
    userId: i.userId,
  }));

  return (
    <div className="flex min-h-screen bg-slate-950">
      <DashboardSidebar role="SELLER" userName={payload.name} userEmail={payload.email} />
      <div className="flex-1 bg-slate-50 p-6">
        <SellerItemsTableClient
          rows={rows}
          sellerId={sellerId}
          categories={categories}
        />
      </div>
    </div>
  );
}
