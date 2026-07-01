import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

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

export default function CommunityPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/v1/articles/article/${id}`);
        setPost(response.data.article);
      } catch (err) {
        console.error(err);
        setError("Article not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      alert("Please login to like this post");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`http://localhost:8000/api/v1/articles/article/${id}/like`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Refresh post to update likes
      setPost(res.data.article);
    } catch (err) {
      console.error(err);
      alert("Failed to like post");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/v1/articles/article/${id}/delete`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert("Post deleted successfully");
      navigate("/community");
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-xl animate-pulse">Loading post...</div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-800">
        <h2 className="text-3xl font-bold mb-4">Post Not Found</h2>
        <Link to="/community" className="text-blue-500 hover:underline text-lg">Return to Community</Link>
      </main>
    );
  }

  const isAuthor = user && post.author && user._id === post.author._id;
  const hasLiked = user && post.likes?.includes(user._id);

  return (
    <main className="bg-gray-50 min-h-screen text-gray-900 py-12 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <button
          onClick={() => navigate("/community")}
          className="text-gray-500 hover:text-gray-800 flex items-center gap-2 mb-8 transition-colors text-sm font-medium cursor-pointer"
        >
          ← Back to Community
        </button>

        <div className="mb-8">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-md inline-block mb-4">
            {post.category}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-b border-gray-100 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {post.author?.name ? post.author.name[0].toUpperCase() : "A"}
              </div>
              <div>
                <div className="font-bold text-gray-900">{post.author?.name || "Anonymous"}</div>
                <div className="text-xs text-gray-500">{timeAgo(post.createdAt)}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-sm flex items-center gap-1">
                👁 {post.viewsCount || 0} views
              </span>
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm font-medium cursor-pointer ${
                  hasLiked 
                    ? "bg-red-50 border-red-200 text-red-500" 
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {hasLiked ? "❤️ Liked" : "🤍 Like"} 
                <span className="font-bold ml-1">{post.likesCount || 0}</span>
              </button>
            </div>
          </div>
        </div>

        {post.articleImage && (
          <img
            src={post.articleImage}
            alt={post.title}
            className="w-full h-[400px] object-cover rounded-xl shadow-sm mb-10"
          />
        )}

        {post.description && (
          <p className="text-lg md:text-xl text-gray-600 font-serif leading-relaxed mb-10 italic border-l-4 border-gray-300 pl-4">
            {post.description}
          </p>
        )}

        <div className="prose prose-lg max-w-none text-gray-800 leading-loose whitespace-pre-wrap">
          {post.content}
        </div>

        {isAuthor && (
          <div className="mt-12 pt-6 border-t border-gray-100 flex justify-end gap-3">
            <button 
              onClick={() => alert("Edit functionality coming soon!")}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm cursor-pointer"
            >
              Edit Post
            </button>
            <button 
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg border border-red-100 hover:bg-red-100 transition-colors text-sm cursor-pointer"
            >
              Delete Post
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
