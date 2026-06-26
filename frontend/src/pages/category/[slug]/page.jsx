"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import CategorySkeleton from "@/app/components/skeletons/CategorySkeleton";

export default function CategoryPage() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageFromUrl = Number(searchParams.get("page") || 1);

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(pageFromUrl);

  const perPage = 6;

  const totalPages = Math.ceil(news.length / perPage);
  const start = (page - 1) * perPage;
  const paginatedNews = news.slice(start, start + perPage);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchCategoryNews = async () => {
      try {
        const response = await fetch(`/api/news?category=${slug}`);
        const data = await response.json();
        setNews(data.articles || []);
      } catch (err) {
        console.error("Error fetching category news:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryNews();
  }, [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const changePage = (num) => {
    setPage(num);
    router.push(`/category/${slug}?page=${num}`);
  };

  if (loading) return <CategorySkeleton />;

  return (
    <main className="px-4 sm:px-6 md:px-12 lg:px-20 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold capitalize">
          {slug} News
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="px-3 py-2 text-sm sm:px-4 sm:py-2 sm:text-base md:px-5 md:py-3 md:text-base bg-gray-100 text-gray-700 rounded-xl shadow-sm cursor-pointer hover:bg-gray-200 hover:shadow-md transition-all font-medium"
          >
            ← Back
          </button>

          <Link
            href="/"
            className="px-3 py-2 text-sm sm:px-4 sm:py-2 sm:text-base md:px-5 md:py-3 md:text-base bg-blue-500 text-white rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md transition-all font-medium"
          >
            Home
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedNews.map((item, i) => (
          <Link
            href={{
              pathname: "/article",
              query: {
                title: item.title,
                description: item.description,
                content: item.content,
                image: item.urlToImage,
                source: item.source?.name,
                published: item.publishedAt,
                url: item.url,
              },
            }}
            key={i}
          >
            <article className="bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02]">
              {item.urlToImage && (
                <img
                  src={item.urlToImage}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-t-xl"
                />
              )}

              <div className="p-4">
                <h2 className="text-lg font-semibold leading-tight">
                  {item.title}
                </h2>

                <p className="text-sm mt-2 text-gray-600 line-clamp-3">
                  {item.description}
                </p>

                <div className="text-xs mt-4 text-gray-500">
                  {item.source?.name} —{" "}
                  {isClient &&
                    item.publishedAt &&
                    new Date(item.publishedAt).toLocaleString()}
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {news.length > 0 && (
        <div className="flex flex-nowrap justify-center items-center gap-1.5 sm:gap-2 md:gap-3 mt-10 px-2 overflow-x-auto">
          <button
            onClick={() => page > 1 && changePage(page - 1)}
            disabled={page === 1}
            className={`px-2 py-1.5 sm:px-3 md:px-4 sm:py-2 text-xs sm:text-sm border rounded-lg transition-all whitespace-nowrap shrink-0 ${
              page === 1
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-gray-100 cursor-pointer active:scale-95"
            }`}
          >
            Prev
          </button>

          {totalPages <= 4 ? (
            Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => changePage(num)}
                className={`px-2 py-1.5 sm:px-2.5 md:px-3 sm:py-2 text-xs sm:text-sm rounded-lg border min-w-7 sm:min-w-8 md:min-w-10 transition-all shrink-0 ${
                  page === num
                    ? "bg-gray-900 text-white cursor-pointer"
                    : "hover:bg-gray-100 cursor-pointer active:scale-95"
                }`}
              >
                {num}
              </button>
            ))
          ) : (
            <>
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => changePage(num)}
                  className={`px-2 py-1.5 sm:px-2.5 md:px-3 sm:py-2 text-xs sm:text-sm rounded-lg border min-w-7 sm:min-w-8 md:min-w-10 transition-all shrink-0 ${
                    page === num
                      ? "bg-gray-900 text-white cursor-pointer"
                      : "hover:bg-gray-100 cursor-pointer active:scale-95"
                  }`}
                >
                  {num}
                </button>
              ))}

              <span className="px-0.5 sm:px-1 text-gray-500 text-xs sm:text-sm shrink-0">
                ...
              </span>

              <button
                onClick={() => changePage(totalPages)}
                className={`px-2 py-1.5 sm:px-2.5 md:px-3 sm:py-2 text-xs sm:text-sm rounded-lg border min-w-7 sm:min-w-8 md:min-w-10 transition-all shrink-0 ${
                  page === totalPages
                    ? "bg-gray-900 text-white cursor-pointer"
                    : "hover:bg-gray-100 cursor-pointer active:scale-95"
                }`}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => page < totalPages && changePage(page + 1)}
            disabled={page === totalPages}
            className={`px-2 py-1.5 sm:px-3 md:px-4 sm:py-2 text-xs sm:text-sm border rounded-lg transition-all whitespace-nowrap shrink-0 ${
              page === totalPages
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-gray-100 cursor-pointer active:scale-95"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
