import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Bookmark } from "lucide-react";

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
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [user, setUser] = useState(null);

  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showToast = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 3000);
  };

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
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/articles/article/${id}`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/comments/all-comments/${id}`)
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
      showToast("Please login to like this post", "error");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/articles/article/${id}/like`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Refresh post to update likes
      setPost(res.data.article);
    } catch (err) {
      console.error(err);
      showToast("Failed to like post", "error");
    }
  };

  const handleSave = async () => {
    if (!user) {
      showToast("Please login to save this post", "error");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/articles/article/${id}/save`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Update local storage and state user
      const updatedUser = res.data.savedUser;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      // Dispatch storage event to keep other tabs/components in sync
      window.dispatchEvent(new Event("storage"));
      showToast(updatedUser.savedArticles.includes(id) ? "Article saved successfully" : "Article removed from saved", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to save post", "error");
    }
  };

  const confirmDeleteAction = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'post') {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/articles/article/${id}/delete`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Post deleted successfully", "success");
        setTimeout(() => navigate("/community"), 1000);
      } catch (err) {
        console.error(err);
        showToast("Failed to delete post", "error");
      }
    } else if (deleteTarget.type === 'comment') {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/comments/delete-comment/${deleteTarget.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setComments(comments.filter(c => c._id !== deleteTarget.id));
        showToast("Comment deleted", "success");
      } catch (err) {
        console.error(err);
        showToast("Failed to delete comment", "error");
      }
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleDelete = () => {
    setDeleteTarget({ type: 'post', id });
    setShowDeleteModal(true);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmittingComment(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/comments/new-comment/${id}`,
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
      showToast("Comment added", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to add comment", "error");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReplySubmit = async (parentId) => {
    if (!replyContent.trim() || !user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/comments/new-comment/${id}`,
        { content: replyContent, parentCommentId: parentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const commentToAdd = {
        ...res.data.comment,
        owner: { _id: user._id, name: user.name, profileImage: user.profileImage },
        likes: []
      };
      setComments([...comments, commentToAdd]);
      setReplyContent("");
      setReplyingToId(null);
      showToast("Reply added", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to add reply", "error");
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      showToast("Please login to like this comment", "error");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/comments/like-comment/${commentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedComment = res.data.comment;
      setComments(comments.map(c => 
        c._id === commentId ? { ...c, likes: updatedComment.likes } : c
      ));
    } catch (err) {
      console.error(err);
      showToast("Failed to like comment", "error");
    }
  };

  const handleDeleteComment = (commentId) => {
    setDeleteTarget({ type: 'comment', id: commentId });
    setShowDeleteModal(true);
  };

  const handleEditCommentSubmit = async (commentId) => {
    if (!editCommentContent.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/v1/comments/update-comment/${commentId}`, 
        { content: editCommentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setComments(comments.map(c => 
        c._id === commentId ? { ...c, content: editCommentContent } : c
      ));
      
      setEditingCommentId(null);
      setEditCommentContent("");
      showToast("Comment updated", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update comment", "error");
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
  const hasSaved = user && user.savedArticles?.includes(id);

  return (
    <main className="bg-gray-50 min-h-screen text-gray-900 py-12 px-6 sm:px-12 relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-fade-in">
          <div className={`px-6 py-3 rounded-full shadow-lg font-medium text-sm text-white ${toastType === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
            {toastMsg}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h3>
            <p className="text-gray-500 mb-6">
              This action cannot be undone. This {deleteTarget?.type} will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteAction}
                className="px-5 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
                onClick={handleSave}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm font-medium cursor-pointer ${
                  hasSaved 
                    ? "bg-blue-50 border-blue-200 text-blue-600" 
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
                title={hasSaved ? "Unsave Article" : "Save Article"}
              >
                <Bookmark size={16} className={hasSaved ? "fill-blue-600" : ""} />
                {hasSaved ? "Saved" : "Save"} 
              </button>
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
              onClick={() => navigate(`/edit-post/${id}`)}
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
              comments.filter(c => !c.parentComment).map((comment) => (
                <div key={comment._id} className="flex flex-col gap-4">
                  <div className="flex gap-4">
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

                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleLikeComment(comment._id)}
                          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${user && comment.likes?.includes(user._id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                        >
                          {user && comment.likes?.includes(user._id) ? "❤️" : "🤍"} 
                          <span>{comment.likes?.length || 0} Likes</span>
                        </button>
                        
                        <button
                          onClick={() => setReplyingToId(replyingToId === comment._id ? null : comment._id)}
                          className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          💬 Reply
                        </button>
                      </div>

                      {replyingToId === comment._id && (
                        <div className="mt-4 flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                             {user?.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">{user?.name?.[0]?.toUpperCase()}</div>}
                          </div>
                          <div className="flex-1">
                            <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Write a reply..."
                              className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                              rows={2}
                            />
                            <div className="flex justify-end mt-2 gap-2">
                              <button
                                onClick={() => { setReplyingToId(null); setReplyContent(""); }}
                                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReplySubmit(comment._id)}
                                disabled={!replyContent.trim()}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {comments.filter(c => c.parentComment === comment._id).length > 0 && (
                    <div className="ml-14 pl-4 border-l-2 border-gray-200 space-y-4 mt-2">
                      {comments.filter(c => c.parentComment === comment._id).map(reply => (
                         <div key={reply._id} className="flex gap-4">
                           <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
                             {reply.owner?.profileImage ? (
                               <img src={reply.owner.profileImage} alt="User" className="w-full h-full object-cover" />
                             ) : (
                               <span className="font-bold text-gray-400 text-xs">
                                 {reply.owner?.name ? reply.owner.name[0].toUpperCase() : "U"}
                               </span>
                             )}
                           </div>
                           <div className="flex-1 bg-white rounded-2xl rounded-tl-none p-4 border border-gray-100 shadow-sm">
                             <div className="flex justify-between items-start mb-2">
                               <div>
                                 <span className="font-semibold text-gray-900 mr-2 text-sm">{reply.owner?.name || "Unknown User"}</span>
                                 <span className="text-xs text-gray-500">{timeAgo(reply.createdAt)}</span>
                               </div>
                               {user && reply.owner && user._id === reply.owner._id && (
                                 <div className="flex gap-2">
                                   <button 
                                     onClick={() => {
                                       setEditingCommentId(reply._id);
                                       setEditCommentContent(reply.content);
                                     }} 
                                     className="text-xs text-gray-500 hover:text-gray-800 hover:underline cursor-pointer transition-colors"
                                   >
                                     Edit
                                   </button>
                                   <button onClick={() => handleDeleteComment(reply._id)} className="text-xs text-red-500 hover:underline cursor-pointer">Delete</button>
                                 </div>
                               )}
                             </div>
                             
                             {editingCommentId === reply._id ? (
                               <div className="mt-2">
                                 <textarea
                                   value={editCommentContent}
                                   onChange={(e) => setEditCommentContent(e.target.value)}
                                   className="w-full border border-gray-200 rounded-xl p-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all text-sm"
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
                                     onClick={() => handleEditCommentSubmit(reply._id)}
                                     disabled={!editCommentContent.trim()}
                                     className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
                                   >
                                     Save
                                   </button>
                                 </div>
                               </div>
                             ) : (
                               <p className="text-gray-700 text-sm whitespace-pre-wrap">{reply.content}</p>
                             )}
                             
                             <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100">
                               <button
                                 onClick={() => handleLikeComment(reply._id)}
                                 className={`flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${user && reply.likes?.includes(user._id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                               >
                                 {user && reply.likes?.includes(user._id) ? "❤️" : "🤍"} 
                                 <span>{reply.likes?.length || 0}</span>
                               </button>
                             </div>
                           </div>
                         </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
