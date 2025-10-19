import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import CommentSection from "./CommentSection";
import { axiosInstance } from "../utility/axios";
import { toast } from "react-toastify";

const Postcard = ({ post, currentUser, refreshPosts }) => {
  const isOwner = currentUser?._id === post.owner?._id;
  const [isEditing, setIsEditing] = useState(false);
  const [updatedContent, setUpdatedContent] = useState(post.content);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ Like feature state
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const likeCountRes = await axiosInstance.get(
          `/v1/like/get-post-like/${post._id}`
        );
        const isLikedRes = await axiosInstance.get(`/v1/like/post/${post._id}`);
        console.log("liked:", isLikedRes);
        setIsLiked(isLikedRes.data.isLiked);
        setLikeCount(likeCountRes.data.likeCount || 0);
      } catch (error) {
        console.log("Er", error);
      }
    };
    fetchLikeStatus();
  }, []);

  // ✅ Toggle like
  const handleToggleLike = async () => {
    if (!currentUser) return toast.error("Please log in to like posts");

    try {
      const res = await axiosInstance.post(
        `/v1/post/toggle-like/${post._id}`,
        {},
        { withCredentials: true }
      );

      const { isLiked, likeCount } = res.data.data;
      setIsLiked(isLiked);
      setLikeCount(likeCount);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to toggle like");
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await axiosInstance.patch(`/v1/post/update-post/${post._id}`, {
        content: updatedContent,
      });
      toast.success("Post updated successfully!");
      setIsEditing(false);
      if (refreshPosts) refreshPosts();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      setDeleting(true);
      await axiosInstance.delete(`/v1/post/${post._id}`);
      toast.success("Post deleted successfully!");
      if (refreshPosts) refreshPosts();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mb-8 p-4 bg-gray-900 rounded-lg text-white shadow-md">
      {/* Post Owner */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={post.owner?.avatar || "/default-avatar.png"}
          alt={post.owner?.username}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold">{post.owner?.username || "Unknown"}</p>
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
        {isOwner && (
          <span className="ml-auto text-xs px-2 py-1 bg-gray-700 rounded">
            Your Post
          </span>
        )}
      </div>

      {/* Post Content */}
      {isEditing ? (
        <div className="mb-4">
          <textarea
            className="w-full p-2 rounded bg-gray-800 text-white"
            value={updatedContent}
            onChange={(e) => setUpdatedContent(e.target.value)}
            rows={4}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="px-3 py-1 bg-green-600 rounded hover:bg-green-700"
            >
              {loading ? "Updating..." : "Update"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm mb-4">{post.content}</p>
      )}

      {/* ✅ Like Button */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleToggleLike}
          className={`px-3 py-1 rounded transition flex items-center gap-1 ${
            isLiked
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          👍 {isLiked ? "Liked" : "Like"}
        </button>
        <span className="text-gray-400 text-sm">{likeCount}</span>
      </div>

      {/* Owner Action Buttons */}
      {isOwner && !isEditing && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-xs"
          >
            Edit Post
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-xs"
          >
            {deleting ? "Deleting..." : "Delete Post"}
          </button>
        </div>
      )}

      {/* Post Media */}
      {post.media && post.media.length > 0 && (
        <div className="mb-4 relative w-full max-w-full">
          {post.media.map((item, idx) => {
            const isVideo = /\.(mp4|webm|ogg)$/i.test(item);
            return (
              <div
                key={idx}
                className={`w-full ${
                  idx === currentIndex ? "block" : "hidden"
                }`}
              >
                {isVideo ? (
                  <video
                    src={item}
                    controls
                    className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                  />
                ) : (
                  <img
                    src={item}
                    alt={`media-${idx}`}
                    className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                  />
                )}
              </div>
            );
          })}

          {/* Prev Button */}
          {post.media.length > 1 && (
            <button
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev === 0 ? post.media.length - 1 : prev - 1
                )
              }
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600"
            >
              ⬅
            </button>
          )}

          {/* Next Button */}
          {post.media.length > 1 && (
            <button
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev === post.media.length - 1 ? 0 : prev + 1
                )
              }
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600"
            >
              ➡
            </button>
          )}
        </div>
      )}

      {/* Comments Section */}
      <CommentSection
        itemId={post._id}
        itemOwnerId={post.owner?._id}
        itemType="post"
      />
    </div>
  );
};

export default Postcard;
