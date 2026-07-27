export default function AgenceLoading() {
  return (
    <div className="min-h-screen bg-gray-50 lg:ml-60">
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mb-8" />

        {/* KPI cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="h-3 w-24 bg-gray-100 rounded animate-pulse mb-3" />
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse shrink-0" />
                <div className="flex-1">
                  <div className="h-4 w-36 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                <div className="h-6 w-14 bg-gray-100 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
