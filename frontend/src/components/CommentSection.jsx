import React, { useEffect, useState } from "react";
import { axiosInstance } from "../utility/axios";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";

const CommentSection = ({ itemId, itemOwnerId, itemType }) => {
  const { user } = useUser();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const fetchComments = async (pageNum = 1) => {
    if (!user) return;
    try {
      setLoading(true);
      let url =
        itemType === "video"
          ? `/v1/comment/${itemId}?userId=${user?._id}`
          : `/v1/post/comment/${itemId}`;

      const res = await axiosInstance.get(url, {
        params: { page: pageNum, limit: 10 },
        withCredentials: true,
      });

      const data = res.data?.data || [];
      const fetchedComments = Array.isArray(data) ? data : data.comments || [];

      if (pageNum === 1) setComments(fetchedComments);
      else setComments((prev) => [...prev, ...fetchedComments]);

      if (fetchedComments.length < 10) setHasMore(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (itemId) fetchComments(1);
  }, [itemId, user]);

  const handleToggleLike = async (commentId) => {
    if (!user) return toast.error("Please log in to like comments");

    try {
      const res = await axiosInstance.post(
        `/v1/comment/toggle-like/${commentId}`,
        {},
        { withCredentials: true }
      );

      const { isLiked, likeCount } = res.data.data;

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, isLiked, likeCount } : c
        )
      );
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to toggle like");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return toast.error("Please enter a comment");

    try {
      setPosting(true);
      let url =
        itemType === "video"
          ? `/v1/comment/add/${itemId}`
          : `/v1/post/comment/add/${itemId}`;

      const res = await axiosInstance.post(
        url,
        { content: newComment },
        { withCredentials: true }
      );

      setNewComment("");
      setComments((prev) => [res.data.data, ...prev]);
      toast.success("Comment added!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add comment");
    } finally {
      setPosting(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return toast.error("Please enter text");
    try {
      const res = await axiosInstance.patch(
        `/v1/comment/update/${commentId}`,
        { content: editContent },
        { withCredentials: true }
      );
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? res.data.data : c))
      );
      toast.success("Comment updated!");
      setEditingCommentId(null);
      setEditContent("");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;
    try {
      const res = await axiosInstance.delete(
        `/v1/comment/delete/${commentId}`,
        { withCredentials: true }
      );
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success(res.data?.message || "Comment deleted!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete comment");
    }
  };

  return (
    <div className="mt-8">
      {/* Header */}
      <h2 className="text-lg font-bold mb-4 text-green-400 neon-text">
        Comments ({comments.length})
      </h2>

      {/* Add Comment */}
      {user ? (
        <form
          onSubmit={handleAddComment}
          className="flex items-start gap-3 mb-6"
        >
          <img
            src={user?.avatar || "/default-avatar.png"}
            alt={user?.username}
            className="w-10 h-10 rounded-full object-cover border-2 border-pink-500"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a public comment..."
              className="w-full bg-gray-800 text-white p-2 rounded-lg outline-none resize-none focus:ring-2 focus:ring-pink-500"
              rows={2}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={posting}
                className={`px-4 py-1 rounded text-sm font-semibold transition ${
                  posting
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-pink-500 hover:bg-pink-600"
                }`}
              >
                {posting ? "Posting..." : "Comment"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="text-gray-400 mb-4">Sign in to comment</p>
      )}

      {/* Comments List */}
      {loading && page === 1 ? (
        <p className="text-cyan-400 animate-pulse">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-red-500">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => {
            const isCommentOwner = user?._id === comment.owner?._id;
            const isItemOwner = user?._id === itemOwnerId;
            const canEditOrDelete = isCommentOwner || isItemOwner;
            const isEditing = editingCommentId === comment._id;

            return (
              <div
                key={comment._id}
                className="flex gap-3 bg-gray-900/50 p-3 rounded-lg border border-blue-500 hover:shadow-lg hover:shadow-blue-500 transition"
              >
                <img
                  src={comment.owner?.avatar || "/default-avatar.png"}
                  alt={comment.owner?.username}
                  className="w-10 h-10 rounded-full object-cover border-2 border-pink-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-green-400 neon-text">
                        {comment.owner?.username || "Unknown"}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {canEditOrDelete && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCommentId(comment._id);
                            setEditContent(comment.content);
                          }}
                          className="text-xs text-blue-400 hover:text-blue-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-xs text-red-400 hover:text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-gray-800 text-white p-2 rounded-lg resize-none outline-none focus:ring-2 focus:ring-green-500"
                        rows={2}
                      />
                      <div className="flex justify-end mt-2 gap-2">
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="text-xs px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditComment(comment._id)}
                          className="text-xs px-3 py-1 rounded bg-green-600 hover:bg-green-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 text-sm mt-1">
                      {comment.content}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => handleToggleLike(comment._id)}
                      className={`text-xs px-2 py-1 rounded transition ${
                        comment.isLiked
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-800 hover:bg-gray-700"
                      }`}
                    >
                      👍 {comment.isLiked ? "Liked" : "Like"}
                    </button>
                    <span className="text-gray-400 text-xs">
                      {comment.likeCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {hasMore && !loading && comments.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => {
              setPage((p) => p + 1);
              fetchComments(page + 1);
            }}
            className="text-sm px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-white neon-button"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
