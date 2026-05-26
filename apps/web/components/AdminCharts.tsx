'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export interface AdminChartsProps {
  data: {
    monthlyData?: { month: string; orders: number }[];
    totalUsers?: number;
  };
}

const tooltipStyle = {
  backgroundColor: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  fontSize: '13px',
};

const axisStyle = { fill: '#94a3b8', fontSize: 12 };

export default function AdminCharts({ data }: AdminChartsProps) {
  const lineData = [
    { month: 'Jan', users: Math.round((data.totalUsers ?? 0) * 0.5) },
    { month: 'Feb', users: Math.round((data.totalUsers ?? 0) * 0.62) },
    { month: 'Mar', users: Math.round((data.totalUsers ?? 0) * 0.74) },
    { month: 'Apr', users: Math.round((data.totalUsers ?? 0) * 0.85) },
    { month: 'Mei', users: data.totalUsers ?? 0 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* BAR CHART */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-slate-900">Order Per Bulan</h2>
          <p className="text-slate-400 text-xs mt-0.5">Jumlah transaksi tiap bulan</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthlyData ?? []} barSize={28}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7D1972" />
                  <stop offset="100%" stopColor="#c96ec4" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="orders" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LINE CHART */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-slate-900">Tren Pertumbuhan User</h2>
          <p className="text-slate-400 text-xs mt-0.5">Estimasi akumulasi pengguna baru</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7D1972" />
                  <stop offset="100%" stopColor="#c96ec4" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="users"
                stroke="url(#lineGrad)"
                strokeWidth={2.5}
                dot={{ fill: '#7D1972', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#7D1972' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
