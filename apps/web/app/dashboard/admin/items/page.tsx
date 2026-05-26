import { cookies } from 'next/headers';
import DashboardSidebar from '@/components/DashboardSidebar';
import DataTableClient from './DataTableClient';

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
    <div className="flex min-h-screen">
      <DashboardSidebar role="ADMIN" />
      <div className="flex-1 p-6">
        <DataTableClient rows={rows} users={users} categories={categories} />
      </div>
    </div>
  );
}
