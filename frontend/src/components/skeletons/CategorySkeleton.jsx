import Skeleton from "../Skeleton";

export default function CategorySkeleton() {
  return (
    <main className="px-4 sm:px-6 md:px-12 lg:px-20 py-8">
      <Skeleton className="h-10 w-40 mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-md overflow-hidden p-4 space-y-3"
          >
            <Skeleton className="w-full h-40" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-3 mt-10">
        <Skeleton className="w-20 h-10" />
        <Skeleton className="w-20 h-10" />
        <Skeleton className="w-20 h-10" />
      </div>
    </main>
  );
}
