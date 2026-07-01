import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function WritePost() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    category: categories[0],
    articleImage: null,
  });

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

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to write a post.");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("content", formData.content);
      data.append("category", formData.category);
      if (formData.articleImage) {
        data.append("articleImage", formData.articleImage);
      }

      await axios.post("http://localhost:8000/api/v1/articles/new-article", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/community");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6 sm:px-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Write a Post</h1>
          <p className="text-gray-500">Share your thoughts with the NextNews community.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 text-sm">
            {error}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
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
            <p className="text-xs text-gray-400 mt-2">Recommended: Upload a high-quality image (JPG, PNG)</p>
          </div>

          <div className="pt-6 flex justify-end gap-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/community")}
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
              {loading ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
