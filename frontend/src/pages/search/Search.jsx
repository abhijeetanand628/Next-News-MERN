import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import SearchSkeleton from "../../components/skeletons/SearchSkeleton";

export default function Search() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const query = params.get("query") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const fetchSearch = async () => {
      try {
        const apiKey = import.meta.env.VITE_NEWS_API_KEY;
        const res = await fetch(`https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}`);
        const data = await res.json();
        setResults(data.articles || []);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item, i) => (
            <Link key={i} to={item.url} target="_blank">
              <article className="p-4 border rounded-xl shadow-sm hover:shadow-md transition">
                {item.urlToImage && (
                  <img
                    src={item.urlToImage}
                    className="rounded mb-3 w-full h-40 object-cover"
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
    </main>
  );
}
