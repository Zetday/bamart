export default function ItemCardSkeleton() {
  return (
    <div className="h-full flex flex-col rounded-lg sm:rounded-xl border border-gray-200 bg-white p-2.5 sm:p-3 md:p-4 shadow-sm animate-pulse">
      {/* Image */}
      <div className="w-full aspect-square rounded-md bg-gray-200 mb-2 sm:mb-3" />

      {/* Badge */}
      <div className="h-3 w-16 bg-gray-200 rounded-full mb-2" />

      {/* Title */}
      <div className="space-y-1 mb-3">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-3 w-20 bg-gray-200 rounded" />
        <div className="h-3 w-10 bg-gray-200 rounded" />
      </div>

      {/* Price */}
      <div className="mt-auto pt-2 border-t border-gray-100">
        <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
        <div className="h-7 w-full bg-gray-300 rounded-md" />
      </div>
    </div>
  );
}
