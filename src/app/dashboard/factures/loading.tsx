export default function FacturesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="h-16 bg-[#1e3a5f]" />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex gap-2 mb-8">
          {[80, 80, 70].map((w, i) => (
            <div key={i} className="h-9 rounded-xl bg-gray-200 animate-pulse" style={{ width: w }} />
          ))}
        </div>
        <div className="flex justify-between mb-8">
          <div className="h-8 w-44 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-11 w-36 rounded-xl bg-gray-200 animate-pulse" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="h-4 w-28 rounded bg-gray-200 animate-pulse mb-2" />
              <div className="h-7 w-20 rounded bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="h-5 w-36 rounded bg-gray-200 animate-pulse" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50">
              <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
              <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
              <div className="h-4 w-24 rounded bg-gray-200 animate-pulse flex-1" />
              <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
              <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
