'use client';

import useSWR from 'swr';
import dynamic from 'next/dynamic';
import {
  Users,
  Package,
  ShoppingCart,
  ArrowUpRight,
} from 'lucide-react';
import DashboardSkeleton from '@/components/skeleton/DashboardSkeleton';
import type { AdminChartsProps } from './AdminCharts';

// Lazy-load heavy chart components — only rendered client-side after data arrives
const AdminCharts = dynamic<AdminChartsProps>(() => import('./AdminCharts'), { ssr: false });

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatDate() {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  delta?: string;
  deltaColor?: string;
}

function StatCard({ label, value, icon, iconBg, delta, deltaColor = 'text-emerald-600' }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        {delta && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${deltaColor}`}>
            <ArrowUpRight size={14} />
            {delta}
          </span>
        )}
      </div>
      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="text-slate-900 text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

export default function AdminDashboardContent() {
  const { data, error } = useSWR('/api/admin/summary', fetcher, {
    refreshInterval: 30_000,      // poll every 30s instead of 5s
    revalidateOnFocus: false,     // don't refetch when tab regains focus
    dedupingInterval: 15_000,
  });

  if (!data && !error) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex-1 p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-sm">Gagal memuat data dashboard.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-[#7D1972] text-sm font-medium hover:underline"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 min-h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">{formatDate()}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live
          </span>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <StatCard
            label="Total User"
            value={data.totalUsers ?? 0}
            icon={<Users size={20} className="text-blue-600" />}
            iconBg="bg-blue-50"
            delta="Aktif"
          />
          <StatCard
            label="Total Produk"
            value={data.totalProducts ?? 0}
            icon={<Package size={20} className="text-violet-600" />}
            iconBg="bg-violet-50"
            delta="Listed"
            deltaColor="text-violet-600"
          />
          <StatCard
            label="Total Order"
            value={data.totalOrders ?? 0}
            icon={<ShoppingCart size={20} className="text-[#7D1972]" />}
            iconBg="bg-pink-50"
            delta="All time"
            deltaColor="text-pink-600"
          />
        </div>

        {/* Charts — lazy loaded */}
        <AdminCharts data={data} />
      </div>
    </div>
  );
}
