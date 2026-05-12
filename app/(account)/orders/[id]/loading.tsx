export default function OrderLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="skeleton h-10 w-64 rounded-lg mb-2" />
      <div className="skeleton h-5 w-96 rounded mb-8" />
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 space-y-4">
            <div className="skeleton h-6 w-1/3 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
