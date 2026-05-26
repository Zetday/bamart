import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import DashboardSidebar from '@/components/DashboardSidebar';
import DataTableClient from './DataTableClient';
import { redirect } from 'next/navigation';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default async function UsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');
  const user = verifyToken(token);
  if (!user) redirect('/login');

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
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <DashboardSidebar role="ADMIN" userName={user.name} userEmail={user.email} />
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
        <DataTableClient rows={rows} />
      </div>
    </div>
  );
}
