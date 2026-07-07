import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import SearchSkeleton from "../../components/skeletons/SearchSkeleton";

export default function Search() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const query = params.get("query") || "";

  const [results, setResults] = useState([]);
  const [communityResults, setCommunityResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const fetchSearch = async () => {
      try {
        const apiKey = import.meta.env.VITE_NEWS_API_KEY;
        const [newsRes, communityRes] = await Promise.all([
          fetch(`https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}`),
          axios.get(`http://localhost:8000/api/v1/articles/all-articles?search=${query}&limit=6`)
        ]);
        
        const newsData = await newsRes.json();
        setResults(newsData.articles || []);
        setCommunityResults(communityRes.data.articles || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    if (query) {
      fetchSearch();
    } else {
      setLoading(false);
    }
  }, [query]);

  return (
    <main className="px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          Search Results for: <span className="text-blue-600">{query}</span>
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-xl shadow-sm hover:bg-gray-200 transition"
          >
            ← Back
          </button>

          <Link
            to="/"
            className="px-3 py-2 text-sm bg-blue-500 text-white rounded-xl shadow-sm hover:bg-blue-700 transition"
          >
            Home
          </Link>
        </div>
      </div>

      {loading && <SearchSkeleton />}

      {!loading && (
        <div className="space-y-12">
          {communityResults.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 border-b pb-2">Community Discussions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {communityResults.map((article) => (
                  <Link key={article._id} to={`/post/${article._id}`}>
                    <article className="p-4 border border-blue-100 rounded-xl shadow-sm hover:shadow-md transition bg-blue-50/30">
                      <img
                        src={article.articleImage || "https://picsum.photos/600/400"}
                        className="rounded mb-3 w-full h-40 object-cover"
                        alt={article.title}
                      />
                      <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-md mb-2 inline-block">
                        {article.category}
                      </span>
                      <h2 className="font-semibold text-lg line-clamp-2">{article.title}</h2>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {article.description}
                      </p>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Global News</h2>
            {results.length === 0 ? (
                <p className="text-gray-500">No news found for this query.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((item, i) => (
                    <Link key={i} to={item.url} target="_blank">
                      <article className="p-4 border rounded-xl shadow-sm hover:shadow-md transition">
                        {item.urlToImage && (
                          <img
                            src={item.urlToImage}
                            className="rounded mb-3 w-full h-40 object-cover"
                            alt={item.title}
                          />
                        )}
                        <h2 className="font-semibold">{item.title}</h2>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                          {item.description}
                        </p>
                      </article>
                    </Link>
                  ))}
                </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
