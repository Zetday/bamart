export default function LoadingItemDetail() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 py-12 animate-pulse">
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* IMAGE */}
        <div className="h-[380px] bg-gray-200 rounded-xl" />

        {/* DETAIL */}
        <div className="space-y-4">
          <div className="h-8 w-40 bg-gray-200 rounded" />
          <div className="h-5 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>

        {/* TOKO */}
        <div className="h-48 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}
