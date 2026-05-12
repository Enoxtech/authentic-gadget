export default function ProductDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="skeleton h-4 w-48 rounded mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="skeleton aspect-square rounded-2xl w-full" />
        <div className="space-y-6">
          <div className="skeleton h-10 w-3/4 rounded-lg" />
          <div className="skeleton h-6 w-32 rounded" />
          <div className="skeleton h-24 w-full rounded-lg" />
          <div className="skeleton h-14 w-full rounded-xl" />
          <div className="skeleton h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
