export default function OrderSuccessSkeleton() {
  return (
    <div className="pt-24 bg-white py-8 md:py-16 mt-20 flex justify-center">
      <div className="max-w-2xl px-4 2xl:px-0 w-full animate-pulse">
        {/* ICON */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-200" />
        </div>

        {/* TITLE */}
        <div className="h-6 w-3/4 mx-auto rounded bg-gray-200 mb-3" />

        {/* SUBTEXT */}
        <div className="h-4 w-full rounded bg-gray-200 mb-2" />
        <div className="h-4 w-5/6 mx-auto rounded bg-gray-200 mb-8" />

        {/* DETAIL BOX */}
        <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50 p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="h-4 w-48 rounded bg-gray-200" />
            </div>
          ))}
        </div>

        {/* BUTTONS */}
        <div className="flex items-center space-x-4 mt-6 justify-center">
          <div className="h-10 w-44 rounded-lg bg-gray-200" />
          <div className="h-10 w-36 rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
