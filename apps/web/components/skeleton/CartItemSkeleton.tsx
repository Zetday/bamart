export default function CartItemSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6 animate-pulse">
      <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
        {/* IMAGE */}
        <div className="h-20 w-20 rounded-md bg-gray-200 dark:bg-gray-700 shrink-0 md:order-1" />

        {/* QUANTITY + PRICE */}
        <div className="flex items-center justify-between md:order-3 md:justify-end gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-8 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700" />
          </div>

          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* DETAILS */}
        <div className="w-full md:max-w-md md:order-2 space-y-3">
          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}
