import Skeleton from "../Skeleton";

export default function SearchSkeleton() {
  return (
    <div className="px-6 py-8">
      <Skeleton className="w-60 h-8 mb-6" /> {/* Title skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-xl shadow-sm space-y-3">
            <Skeleton className="w-full h-40 rounded" /> {/* Image */}
            <Skeleton className="w-3/4 h-5" /> {/* Title */}
            <Skeleton className="w-full h-4" /> {/* Description */}
            <Skeleton className="w-2/3 h-4" /> {/* Description small */}
          </div>
        ))}
      </div>
    </div>
  );
}
