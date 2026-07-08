import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const categories = [
  "Technology",
  "General",
  "Gaming",
  "Health",
  "Business",
  "Sports",
  "Entertainment",
];

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    category: categories[0],
    articleImage: null,
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/articles/article/${id}`);
        const article = response.data.article;
        
        // Ensure only the author can edit (basic frontend check)
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (article.author._id !== user._id) {
            alert("You are not authorized to edit this post.");
            navigate(`/post/${id}`);
            return;
          }
        }

        setFormData({
          title: article.title || "",
          description: article.description || "",
          content: article.content || "",
          category: article.category || categories[0],
          articleImage: null, // Keep null, only update if user uploads a new one
        });
      } catch (err) {
        console.error(err);
        setError("Article not found or server error.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchPost();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "articleImage") {
      setFormData((prev) => ({ ...prev, articleImage: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("content", formData.content);
      data.append("category", formData.category);
      if (formData.articleImage) {
        data.append("articleImage", formData.articleImage);
      }

      await axios.patch(`${import.meta.env.VITE_API_URL}/api/v1/articles/article/${id}/update`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate(`/post/${id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-xl animate-pulse">Loading post data...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6 sm:px-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Edit Post</h1>
          <p className="text-gray-500">Update your thoughts for the NextNews community.</p>
        </div>

        {error && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-2xl border border-red-100 shadow-2xl flex flex-col items-center gap-3 min-w-[320px] max-w-md text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-2 border border-red-100">
                <span className="text-red-500 text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Oops!</h3>
              <p className="text-red-600 font-medium">{error}</p>
              <button 
                onClick={() => setError("")}
                type="button"
                className="mt-4 px-8 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors text-sm font-bold cursor-pointer w-full border border-red-100"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Give your post a catchy title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all capitalize appearance-none bg-white cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description <span className="text-red-500">*</span></label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              placeholder="A brief summary of what your post is about"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Content <span className="text-red-500">*</span></label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={8}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
              placeholder="Write your full thoughts here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Update Cover Image</label>
            <input
              type="file"
              name="articleImage"
              onChange={handleChange}
              accept="image/*"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-xl file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-600
                hover:file:bg-blue-100 cursor-pointer border border-gray-200 rounded-xl p-2"
            />
            <p className="text-xs text-gray-400 mt-2">Leave empty to keep the existing image. Recommended: JPG, PNG</p>
          </div>

          <div className="pt-6 flex justify-end gap-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(`/post/${id}`)}
              className="px-6 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] cursor-pointer ${
                loading ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
              }`}
            >
              {loading ? "Updating..." : "Update Post"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
