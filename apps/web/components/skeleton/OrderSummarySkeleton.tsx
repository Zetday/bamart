export default function OrderSummarySkeleton() {
  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6 animate-pulse">
      <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-700" />

      <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
        <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />

      <div className="flex justify-center">
        <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}
