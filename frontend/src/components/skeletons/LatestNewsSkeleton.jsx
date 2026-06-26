export default function LatestNewsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden shadow-md bg-gray-200 animate-pulse h-60"
        ></div>
      ))}
    </div>
  );
}
