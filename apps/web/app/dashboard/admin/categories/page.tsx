import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import DashboardSidebar from '@/components/DashboardSidebar';
import DataTableClient from './DataTableClient';
import { redirect } from 'next/navigation';

interface Category {
  id: number;
  name: string;
  description: string | null;
}

export default async function AdminCategoriesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');
  const user = verifyToken(token);
  if (!user) redirect('/login');
  const apiBaseUrl = process.env.API_URL || 'http://localhost:8080';
  const categoriesRes = await fetch(`${apiBaseUrl}/api/categories`, { cache: 'no-store' });
  const categoriesEnvelope = await categoriesRes.json();
  const categories: Category[] = Array.isArray(categoriesEnvelope.data)
    ? categoriesEnvelope.data
    : Array.isArray(categoriesEnvelope)
    ? categoriesEnvelope
    : [];

  const rows = categories.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description ?? '',
  }));

  return (
    <div className="flex min-h-screen bg-slate-950">
      <DashboardSidebar role="ADMIN" userName={user.name} userEmail={user.email} />
      <main className="flex-1 bg-slate-50 p-6">
        <DataTableClient rows={rows} />
      </main>
    </div>
  );
}
