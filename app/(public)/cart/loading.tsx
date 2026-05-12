export default function CartLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="skeleton h-10 w-48 rounded-lg mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 bg-white rounded-2xl p-4">
              <div className="skeleton w-24 h-24 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
                <div className="skeleton h-8 w-32 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="skeleton h-48 rounded-2xl w-full" />
        </div>
      </div>
    </div>
  );
}
