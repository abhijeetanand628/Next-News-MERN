import { MoveLeft } from "lucide-react";
import DbNewsFeedSkeleton from "../components/skeletons/DbNewsFeedSkeleton";

export default function Loading() {
  return (
    <main className="px-6 md:px-12 lg:px-24 py-8">
      {/* Header Section with Buttons (Static to prevent jumping) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold">My Saved Articles</h1>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium flex items-center gap-1 opacity-50 cursor-not-allowed">
            <MoveLeft size={16} />
            Back
          </div>
          <div className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium opacity-50 cursor-not-allowed">
            Home
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <DbNewsFeedSkeleton />
    </main>
  );
}
