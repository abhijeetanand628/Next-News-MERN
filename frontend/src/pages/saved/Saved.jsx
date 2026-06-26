import { Link, useNavigate } from "react-router-dom";
import { MoveLeft } from "lucide-react";
import { useState, useEffect } from "react";

export default function Saved() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedArticles") || "[]");
    setArticles(saved);
  }, []);

  return (
    <main className="px-6 md:px-12 lg:px-24 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold">My Saved Articles</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer"
          >
            <MoveLeft size={16} />
            Back
          </button>
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Home
          </Link>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <p className="text-xl text-gray-500 mb-4">
            You haven't saved any articles yet.
          </p>
          <Link to="/" className="text-blue-600 hover:underline">
            Browse News
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((item, i) => (
            <Link key={i} to={`/article/${encodeURIComponent(item.title)}`} state={item}>
              <article className="p-4 border rounded-xl shadow-sm hover:shadow-md transition">
                {item.image && (
                  <img
                    src={item.image}
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
