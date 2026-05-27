export default function ItemCardSkeleton() {
  return (
    <div className="h-full flex flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-xs animate-pulse dark:border-slate-800 dark:bg-slate-900">
      {/* Image Container */}
      <div className="relative w-full aspect-square rounded-lg bg-slate-100 dark:bg-slate-950 mb-3 flex items-center justify-center">
        {/* Fake Badge Overlay */}
        <div className="absolute top-2.5 left-2.5 w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>

      {/* Title */}
      <div className="space-y-1.5 mb-3 grow">
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-full" />
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3.5 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-3 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>

      {/* Price + Button */}
      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-col mb-3">
          <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded mt-1.5" />
        </div>
        <div className="h-9 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
