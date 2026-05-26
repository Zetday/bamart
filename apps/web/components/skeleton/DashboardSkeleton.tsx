'use client';

export function StatCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div className="w-11 h-11 bg-slate-100 rounded-lg" />
        <div className="w-16 h-4 bg-slate-100 rounded-full" />
      </div>
      <div className="w-20 h-3 bg-slate-100 rounded-full mb-3" />
      <div className="w-28 h-8 bg-slate-200 rounded-lg" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-slate-100 rounded-lg" />
        <div className="w-40 h-5 bg-slate-100 rounded-full" />
      </div>
      {/* Fake bars */}
      <div className="flex items-end gap-3 h-52 px-2">
        {[40, 70, 55, 80, 60, 90, 45, 75, 65, 85, 50, 70].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-slate-100 rounded-t-md"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="flex-1 p-8 bg-slate-50 min-h-screen">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="w-48 h-7 bg-slate-200 rounded-lg animate-pulse mb-2" />
        <div className="w-72 h-4 bg-slate-100 rounded-full animate-pulse" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}
