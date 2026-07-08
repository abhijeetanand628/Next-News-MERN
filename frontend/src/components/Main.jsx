
import { useEffect, useState } from "react";
import HotTopics from "./HotTopics";
import LatestNews from "./LatestNews";
import HotTopicsSkeleton from "./skeletons/HotTopicsSkeleton";
import LatestNewsSkeleton from "./skeletons/LatestNewsSkeleton";

export default function Main() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentHotIndex, setCurrentHotIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [page, setPage] = useState(1);

  const perPage = 8;

  // Pagination Math
  const totalPages = Math.ceil(news.length / perPage);
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const paginatedNews = news.slice(start, end);

  useEffect(() => {
    const getNews = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/news/top-headlines?country=us`);
        const data = await response.json();
        setNews(data.articles || []);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    getNews();
  }, []);
  const featuredArticle = news[currentHotIndex] || null;

  useEffect(() => {
    if (news.length === 0) return;
    if (isPaused) return;

    const interval = setInterval(() => {
      setVisible(false);

      setTimeout(() => {
        setCurrentHotIndex((prev) => (prev === news.length - 1 ? 0 : prev + 1));
        setVisible(true);
      }, 250);
    }, 3000);

    return () => clearInterval(interval);
  }, [news, isPaused]);

  useEffect(() => {
    scrollToTop();
  }, [page]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <main className="px-6 md:px-12 lg:px-24 py-8">
      <h1 className="text-4xl font-bold mb-6">Hot Topics</h1>

      {loading ? (
        <HotTopicsSkeleton />
      ) : (
        <div
          className={`transition-opacity duration-300 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <HotTopics
            article={featuredArticle}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          />
        </div>
      )}

      <h2 className="text-3xl font-bold mt-14 mb-6">Latest News</h2>

      {loading ? (
        <LatestNewsSkeleton />
      ) : (
        <LatestNews articles={paginatedNews} />
      )}

      {!loading && news.length > 0 && (
        <div className="flex flex-nowrap justify-center items-center gap-1.5 sm:gap-2 md:gap-3 mt-10 px-2 overflow-x-auto">
          {/* Prev */}
          <button
            onClick={() => {
              if (page > 1) {
                setPage(page - 1);
                scrollToTop();
              }
            }}
            disabled={page === 1}
            className={`px-2 py-1.5 sm:px-3 md:px-4 sm:py-2 text-xs sm:text-sm border rounded-lg transition-all whitespace-nowrap shrink-0 ${
              page === 1
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-gray-100 cursor-pointer active:scale-95"
            }`}
          >
            Prev
          </button>

          {/* Page Buttons */}
          {totalPages <= 4 ? (
            Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
              (num) => (
                <button
                  key={num}
                  onClick={() => {
                    setPage(num);
                    scrollToTop();
                  }}
                  className={`px-2 py-1.5 sm:px-2.5 md:px-3 sm:py-2 text-xs sm:text-sm rounded-lg border min-w-7 sm:min-w-8 md:min-w-10 transition-all shrink-0 ${
                    page === num
                      ? "bg-gray-900 text-white cursor-pointer"
                      : "hover:bg-gray-100 cursor-pointer active:scale-95"
                  }`}
                >
                  {num}
                </button>
              ),
            )
          ) : (
            <>
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setPage(num);
                    scrollToTop();
                  }}
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
                onClick={() => {
                  setPage(totalPages);
                  scrollToTop();
                }}
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

          {/* Next */}
          <button
            onClick={() => {
              if (page < totalPages) {
                setPage(page + 1);
                scrollToTop();
              }
            }}
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
