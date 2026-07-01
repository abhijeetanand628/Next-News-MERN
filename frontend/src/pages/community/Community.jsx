import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function timeAgo(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

export default function Community() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/v1/articles/all-articles");
        // Accessing the 'articles' array from our JSON response
        setArticles(response.data.articles || []);
      } catch (error) {
        console.error("Error fetching community articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <main className="px-6 md:px-12 lg:px-24 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Community Thoughts</h1>
        <Link 
          to="/write" 
          className="bg-gray-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Write a Post
        </Link>
      </div>

      <p className="text-gray-500 mb-10 text-lg">
        Read opinions, blogs, and thoughts shared by our community.
      </p>

      {loading ? (
        <div className="text-center text-gray-500">Loading articles...</div>
      ) : articles.length === 0 ? (
        <div className="text-center text-gray-500 py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="mb-4">No community posts yet.</p>
          <Link to="/write" className="text-blue-600 hover:underline">Be the first to write one!</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {articles.map((article) => (
            <Link
              key={article._id}
              to={`/post/${article._id}`}
              className="rounded-xl overflow-hidden shadow-sm bg-white block cursor-pointer hover:scale-[1.03] hover:shadow-md duration-300 transition-all border border-gray-100"
            >
              <img
                src={article.articleImage || "https://picsum.photos/600/400"}
                alt={article.title}
                className="w-full h-40 object-cover"
              />

              <div className="p-4">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block">
                  {article.category}
                </span>
                
                <h3 className="font-bold text-lg mb-2 leading-snug text-gray-900">
                  {article.title?.slice(0, 60)}
                  {article.title?.length > 60 ? "..." : ""}
                </h3>

                <div className="flex items-center gap-3 text-xs text-gray-500 mt-4">
                  <span className="font-medium text-gray-700">
                    {article.author?.name || "Anonymous"}
                  </span>
                  <span>•</span>
                  <span>{timeAgo(article.createdAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
