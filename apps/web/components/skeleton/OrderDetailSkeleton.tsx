export default function OrderDetailSkeleton() {
  return (
    <div className="pt-24 px-4 max-w-3xl mx-auto pb-12 animate-pulse">
      {/* TITLE */}
      <div className="h-7 w-64 bg-gray-200 rounded mb-3" />
      <div className="h-4 w-40 bg-gray-200 rounded mb-6" />

      {/* ORDER INFO */}
      <div className="rounded-lg border bg-gray-50 p-6 space-y-4 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex justify-between gap-4">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* ITEMS */}
      <div className="h-5 w-48 bg-gray-200 rounded mb-3" />

      <div className="space-y-4 mb-8">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg border p-4 bg-white"
          >
            <div className="w-16 h-16 bg-gray-200 rounded-md" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-3 w-1/2 bg-gray-200 rounded" />
            </div>

            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* SUMMARY */}
      <div className="rounded-lg border bg-gray-50 p-6 space-y-3 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* BUTTONS */}
      <div className="flex flex-wrap items-center gap-4 mt-6">
        <div className="h-10 w-40 bg-gray-200 rounded-lg" />
        <div className="h-10 w-36 bg-gray-200 rounded-lg" />
        <div className="h-10 w-44 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}
