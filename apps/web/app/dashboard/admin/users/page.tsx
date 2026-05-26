import { cookies } from 'next/headers';
import DashboardSidebar from '@/components/DashboardSidebar';
import DataTableClient from './DataTableClient';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default async function UsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const apiBaseUrl = process.env.API_URL || 'http://localhost:8080';
  const res = await fetch(`${apiBaseUrl}/api/users`, {
    headers: {
      Cookie: `token=${token}`,
    },
    cache: 'no-store',
  });
  const envelope = await res.json();
  const users: AdminUser[] = Array.isArray(envelope.data)
    ? envelope.data
    : Array.isArray(envelope)
    ? envelope
    : [];

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
  }));

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar role="ADMIN" />

      <div className="flex-1 p-6">
        <DataTableClient rows={rows} />
      </div>
    </div>
  );
}
