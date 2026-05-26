import DashboardSidebar from '@/components/DashboardSidebar';
import DataTableClient from './DataTableClient';

interface Category {
  id: number;
  name: string;
  description: string | null;
}

export default async function AdminCategoriesPage() {
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
    <div className="flex min-h-screen">
      <DashboardSidebar role="ADMIN" />

      <main className="flex-1 p-6">
        <DataTableClient rows={rows} />
      </main>
    </div>
  );
}
