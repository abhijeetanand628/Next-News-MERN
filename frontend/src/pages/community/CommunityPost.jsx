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
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
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
    const fetchPostAndComments = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/v1/articles/article/${id}`),
          axios.get(`http://localhost:8000/api/v1/comments/all-comments/${id}`)
        ]);
        
        setPost(postRes.data.article);
        setComments(commentsRes.data.comments || []);
      } catch (err) {
        console.error(err);
        setError("Article not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchPostAndComments();
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

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmittingComment(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:8000/api/v1/comments/new-comment/${id}`,
        { content: newComment },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Populate owner immediately for UI rendering
      const commentToAdd = {
        ...res.data.comment,
        owner: { _id: user._id, name: user.name, profileImage: user.profileImage }
      };

      setComments([commentToAdd, ...comments]);
      setNewComment("");
    } catch (err) {
      console.error(err);
      alert("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/v1/comments/delete-comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete comment");
    }
  };

  const handleEditCommentSubmit = async (commentId) => {
    if (!editCommentContent.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:8000/api/v1/comments/update-comment/${commentId}`, 
        { content: editCommentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setComments(comments.map(c => 
        c._id === commentId ? { ...c, content: editCommentContent } : c
      ));
      
      setEditingCommentId(null);
      setEditCommentContent("");
    } catch (err) {
      console.error(err);
      alert("Failed to update comment");
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

        {/* Comments Section */}
        <div className="mt-16 border-t border-gray-100 pt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Comments ({comments.length})
          </h2>

          {user ? (
            <form onSubmit={handleAddComment} className="mb-10 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full border border-gray-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
                  rows={3}
                  required
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submittingComment ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center mb-10">
              <p className="text-gray-600 mb-3">Join the discussion to share your thoughts!</p>
              <Link to="/login" className="inline-block px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                Log In or Sign Up
              </Link>
            </div>
          )}

          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-gray-500 italic">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
                    {comment.owner?.profileImage ? (
                      <img src={comment.owner.profileImage} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-gray-400">
                        {comment.owner?.name ? comment.owner.name[0].toUpperCase() : "U"}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-none p-4 border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-gray-900 mr-2">{comment.owner?.name || "Unknown User"}</span>
                        <span className="text-xs text-gray-500">{timeAgo(comment.createdAt)}</span>
                      </div>
                      {user && comment.owner && user._id === comment.owner._id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingCommentId(comment._id);
                              setEditCommentContent(comment.content);
                            }}
                            className="px-3 py-1 text-gray-700 bg-white hover:bg-gray-100 transition-colors border border-gray-300 rounded text-xs font-medium cursor-pointer"
                            title="Edit Comment"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="px-3 py-1 text-white bg-red-500 hover:bg-red-600 transition-color border border-red-200 rounded text-xs font-medium cursor-pointer"
                            title="Delete Comment"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {editingCommentId === comment._id ? (
                      <div className="mt-2">
                        <textarea
                          value={editCommentContent}
                          onChange={(e) => setEditCommentContent(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all text-sm"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditCommentContent("");
                            }}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEditCommentSubmit(comment._id)}
                            disabled={!editCommentContent.trim()}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
