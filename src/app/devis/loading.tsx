export default function DevisLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 h-16 bg-white border-b border-gray-100 flex items-center px-6 justify-between">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-3">
          <div className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-8 w-28 bg-orange-100 rounded-lg animate-pulse" />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Title skeleton */}
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Progress bar skeleton */}
        <div className="flex gap-2 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 h-2 rounded-full bg-gray-200 animate-pulse" />
          ))}
        </div>

        {/* Form card skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse mb-2" />
                <div className="h-11 w-full bg-gray-100 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
