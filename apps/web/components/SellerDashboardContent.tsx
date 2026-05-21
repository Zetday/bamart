'use client';

import useSWR from 'swr';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SellerDashboardContent() {
  const { data, error } = useSWR('/api/seller/summary', fetcher, {
    refreshInterval: 5000,
  });

  if (!data) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7D1972] to-[#b14fab] bg-clip-text text-transparent mb-2">
          Dashboard Seller
        </h1>
        <p className="text-gray-600 text-lg">
          Statistik performa toko Anda berdasarkan data terbaru
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Total Produk */}
        <div className="group relative p-6 bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Package size={28} className="text-white" />
              </div>
              <TrendingUp className="text-green-500" size={24} />
            </div>
            <h2 className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-2">
              Total Produk Saya
            </h2>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {data.totalProducts}
            </p>
          </div>
        </div>

        {/* Total Order */}
        <div className="group relative p-6 bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <ShoppingCart size={28} className="text-white" />
              </div>
              <TrendingUp className="text-green-500" size={24} />
            </div>
            <h2 className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-2">
              Total Pesanan Masuk
            </h2>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {data.totalOrders}
            </p>
          </div>
        </div>

        {/* Total Pendapatan */}
        <div className="group relative p-6 bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <DollarSign size={28} className="text-white" />
              </div>
              <TrendingUp className="text-green-500" size={24} />
            </div>
            <h2 className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-2">
              Total Pendapatan
            </h2>
            <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Rp {Number(data.totalRevenue).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BAR CHART: ORDER PER MONTH */}
        <div className="bg-white p-8 border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7D1972] to-[#b14fab] flex items-center justify-center">
              <BarChart3 className="text-white" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Penjualan Per Bulan
            </h2>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer>
              <BarChart data={data.monthlySales}>
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  tick={{ fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar
                  dataKey="orders"
                  fill="url(#colorGradient)"
                  radius={[10, 10, 0, 0]}
                />
                <defs>
                  <linearGradient
                    id="colorGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#7D1972" />
                    <stop offset="100%" stopColor="#b14fab" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LINE CHART: REVENUE TREND */}
        <div className="bg-white p-8 border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Trend Pendapatan
            </h2>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer>
              <LineChart data={data.revenueTrend}>
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  tick={{ fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={4}
                  dot={{ fill: '#10b981', r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
