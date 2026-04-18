export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header style={{ backgroundColor: "var(--navy)" }}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="h-5 w-32 bg-white/20 rounded animate-pulse" />
          <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Nav skeleton */}
        <div className="flex gap-2 mb-8">
          {[80, 80, 70].map((w, i) => (
            <div key={i} className="h-9 rounded-xl bg-gray-200 animate-pulse" style={{ width: w }} />
          ))}
        </div>

        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="h-7 w-52 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-11 w-40 bg-orange-100 rounded-xl animate-pulse" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="h-3 w-20 bg-gray-100 rounded animate-pulse mb-2" />
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-10 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-36 bg-gray-100 rounded animate-pulse flex-1" />
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
