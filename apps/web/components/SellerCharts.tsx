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

export interface SellerChartsProps {
  data: {
    monthlySales?: { month: string; orders: number }[];
    revenueTrend?: { month: string; revenue: number }[];
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

export default function SellerCharts({ data }: SellerChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* BAR CHART — Monthly Sales */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-slate-900">Penjualan Per Bulan</h2>
          <p className="text-slate-400 text-xs mt-0.5">Jumlah order per bulan</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthlySales ?? []} barSize={28}>
              <defs>
                <linearGradient id="sellerBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7D1972" />
                  <stop offset="100%" stopColor="#c96ec4" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="orders" fill="url(#sellerBarGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LINE CHART — Revenue Trend */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-slate-900">Tren Pendapatan</h2>
          <p className="text-slate-400 text-xs mt-0.5">Pendapatan bulanan (Rp)</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.revenueTrend ?? []}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                width={55}
                tickFormatter={(v) =>
                  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}jt` : String(v)
                }
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`Rp ${v.toLocaleString('id-ID')}`, 'Pendapatan']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
