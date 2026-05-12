export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="skeleton h-10 w-64 rounded-lg mb-2" />
        <div className="skeleton h-5 w-96 rounded" />
      </div>
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="skeleton h-12 w-full md:w-48 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 space-y-3">
            <div className="skeleton aspect-square rounded-xl w-full" />
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
            <div className="skeleton h-6 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
