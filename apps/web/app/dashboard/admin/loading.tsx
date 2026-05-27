import DashboardSkeleton from '@/components/skeleton/DashboardSkeleton';

export default function Loading() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar Skeleton */}
      <aside className="w-60 bg-slate-950 border-r border-slate-800 shrink-0 hidden md:block">
        <div className="px-5 pt-7 pb-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 animate-pulse" />
          <div className="w-24 h-4 bg-slate-800 rounded-full animate-pulse" />
        </div>
        <div className="px-3 py-5 space-y-0.5">
          <div className="w-12 h-3 bg-slate-800 rounded-full animate-pulse px-3 mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <div className="w-5 h-5 rounded bg-slate-800 animate-pulse" />
                <div className="w-28 h-4 bg-slate-800 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <div className="flex-1 bg-slate-50 overflow-y-auto">
        <DashboardSkeleton />
      </div>
    </div>
  );
}
