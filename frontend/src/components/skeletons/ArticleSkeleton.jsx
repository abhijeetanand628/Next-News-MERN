import Skeleton from "../Skeleton";

export default function ArticleSkeleton() {
  return (
    <main className="px-4 sm:px-6 md:px-12 lg:px-20 py-8 max-w-3xl mx-auto">
      <Skeleton className="w-full h-72 mb-6" />

      <Skeleton className="h-8 w-3/4 mb-4" />

      <Skeleton className="h-4 w-40 mb-6" />

      <Skeleton className="h-4 w-full mb-3" />
      <Skeleton className="h-4 w-5/6 mb-3" />
      <Skeleton className="h-4 w-4/6 mb-6" />

      <div className="flex justify-center gap-4 mt-10">
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-12 w-32" />
      </div>

      <Skeleton className="h-8 w-56 mt-10 mx-auto" />
    </main>
  );
}
