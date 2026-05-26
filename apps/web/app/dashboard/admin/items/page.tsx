import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import DashboardSidebar from '@/components/DashboardSidebar';
import DataTableClient from './DataTableClient';
import { redirect } from 'next/navigation';

interface AdminItem {
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

export default async function AdminItemsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');
  const user = verifyToken(token);
  if (!user) redirect('/login');

  const apiBaseUrl = process.env.API_URL || 'http://localhost:8080';
  const [itemsRes, usersRes, categoriesRes] = await Promise.all([
    fetch(`${apiBaseUrl}/api/items`, { cache: 'no-store' }),
    fetch(`${apiBaseUrl}/api/users`, {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store',
    }),
    fetch(`${apiBaseUrl}/api/categories`, { cache: 'no-store' }),
  ]);

  const itemsEnvelope = await itemsRes.json();
  const items: AdminItem[] = Array.isArray(itemsEnvelope.data)
    ? itemsEnvelope.data
    : Array.isArray(itemsEnvelope)
    ? itemsEnvelope
    : [];

  const usersEnvelope = await usersRes.json();
  const users = Array.isArray(usersEnvelope.data)
    ? usersEnvelope.data
    : Array.isArray(usersEnvelope)
    ? usersEnvelope
    : [];

  const categoriesEnvelope = await categoriesRes.json();
  const categories = Array.isArray(categoriesEnvelope.data)
    ? categoriesEnvelope.data
    : Array.isArray(categoriesEnvelope)
    ? categoriesEnvelope
    : [];

  // Bentuk data baris tabel
  const rows = items.map((i) => ({
    id: i.id,
    name: i.name,
    price: i.price,
    stock: i.stock,
    description: i.description ?? '',
    imageUrl: i.imageUrl,
    seller: i.seller,
    userId: i.userId, // ⭐ FIX UTAMA
    category: i.category ?? null,
    categoryId: i.categoryId ?? null,
  }));

  return (
    <div className="flex min-h-screen bg-slate-950">
      <DashboardSidebar role="ADMIN" userName={user.name} userEmail={user.email} />
      <div className="flex-1 bg-slate-50 p-6">
        <DataTableClient rows={rows} users={users} categories={categories} />
      </div>
    </div>
  );
}
