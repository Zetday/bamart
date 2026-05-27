export default function ItemCardSkeleton() {
  return (
    <div className="h-full flex flex-col rounded-lg sm:rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3 md:p-4 shadow-xs animate-pulse dark:border-slate-800 dark:bg-slate-900">
      {/* Image Container */}
      <div className="relative w-full aspect-square rounded-md bg-slate-100 dark:bg-slate-950 mb-2 sm:mb-3 flex items-center justify-center">
        {/* Fake Badge Overlay */}
        <div className="absolute top-2.5 left-2.5 w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>

      {/* Title */}
      <div className="space-y-1.5 mb-1.5 sm:mb-2 grow">
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-full" />
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <div className="w-3.5 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-3 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>

      {/* Price + Button */}
      <div className="flex flex-col gap-2 sm:gap-3 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-col">
          <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded mt-1.5" />
        </div>
        <div className="h-9 sm:h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-md sm:rounded-lg" />
      </div>
    </div>
  );
}
