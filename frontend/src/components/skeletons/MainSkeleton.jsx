import Skeleton from "../Skeleton";

export default function MainSkeleton() {
  return (
    <main className="px-6 md:px-12 lg:px-24 py-8">
      <Skeleton className="h-10 w-40 mb-8" />

      {/* Hot Topic Skeleton */}
      <div className="space-y-4 mb-14">
        <Skeleton className="w-full h-64 rounded-xl" />
        <Skeleton className="w-3/4 h-6" />
        <Skeleton className="w-1/2 h-4" />
      </div>

      <Skeleton className="h-10 w-40 mb-6" />

      {/* Latest News Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="w-full h-40 rounded-xl" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-3 mt-10">
        <Skeleton className="w-16 h-10" />
        <Skeleton className="w-16 h-10" />
        <Skeleton className="w-16 h-10" />
      </div>
    </main>
  );
}
