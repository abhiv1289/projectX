import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../utility/axios";
import { toast } from "react-toastify";
import { useUser } from "../context/UserContext";
import { useState, useRef, useEffect } from "react";
import PlaylistModal from "./PlaylistModal";

export const VideoCard = ({ video, onVideoDeleted, onVideoUpdated }) => {
  const {
    _id,
    thumbnail,
    title,
    views,
    createdAt,
    duration,
    channelName,
    owner,
    isPublished,
  } = video;

  const navigate = useNavigate();
  const { user } = useUser();

  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(isPublished);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [isInWatchLater, setIsInWatchLater] = useState(false);
  useEffect(() => {
    const fetchWatchLaterStatus = async () => {
      try {
        const res = await axiosInstance.get("/v1/video/list");
        const savedVideos = res.data?.data || [];
        const found = savedVideos.some((v) => v._id === video._id);
        setIsInWatchLater(found);
      } catch (err) {
        console.error("Failed to fetch watch later list", err);
      }
    };

    fetchWatchLaterStatus();
  }, [video._id]);

  const fileInputRef = useRef(null);

  const isOwner = (user && user?._id === owner?._id) || user?._id === owner;
  if (!published && !isOwner) return null;

  const formatViews = (count) => {
    if (!count || isNaN(count)) return "0";
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return count.toString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      setLoading(true);
      const res = await axiosInstance.delete(`/v1/video/delete-video/${_id}`, {
        withCredentials: true,
      });
      toast.success(res.data?.message || "Video deleted successfully!");
      if (onVideoDeleted) onVideoDeleted(_id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete video");
    } finally {
      setLoading(false);
    }
  };

  const triggerFileUpload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current.click();
  };

  const handleAddToWatchLater = async (videoId) => {
    try {
      const res = await axiosInstance.post(
        "/v1/video/add",
        { videoId },
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Added to Watch Later!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add to Watch Later"
      );
    }
  };

  const handleRemoveFromWatchLater = async (videoId) => {
    try {
      await axiosInstance.post(
        "/v1/video/remove",
        { videoId },
        { withCredentials: true }
      );
      toast.success("Removed from Watch Later!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to remove from Watch Later"
      );
    }
  };

  const handleFileChange = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.target.files[0];
    if (!file) return toast.error("No file selected");
    if (!file.type.startsWith("image/"))
      return toast.error("Select a valid image");

    const formData = new FormData();
    formData.append("thumbnail", file);

    try {
      setLoading(true);
      const res = await axiosInstance.patch(
        `/v1/video/update-video/${_id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      toast.success(res.data?.message || "Thumbnail updated!");
      if (onVideoUpdated) onVideoUpdated(res.data?.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update thumbnail");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleTogglePublish = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoading(true);
      const res = await axiosInstance.patch(
        `/v1/video/publish-status/${_id}`,
        {},
        { withCredentials: true }
      );
      setPublished((prev) => !prev);
      toast.success(res.data?.message || "Publish status updated!");
      if (onVideoUpdated) onVideoUpdated(res.data?.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle status");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async () => {
    try {
      // If user is logged in, add video to history
      if (user && user._id) {
        await axiosInstance.post(
          "/v1/auth/add-to-history",
          { videoId: _id },
          { withCredentials: true }
        );
      }

      // Navigate to video page (works for both logged-in and guest users)
      navigate(`/video/${_id}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="group relative overflow-hidden 
bg-gray-900/60 
border border-gray-700 
rounded-xl shadow-md 
hover:drop-shadow-blue-950
transition-all duration-300

"
    >
      {/* Thumbnail */}
      <div className="cursor-pointer" onClick={handleClick}>
        <div
          className="relative aspect-video overflow-hidden rounded-xl 
    border border-gray-700 bg-gray-800/40 
    shadow-md group-hover:shadow-xl transition-all duration-300"
        >
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover 
      transition-transform duration-500 group-hover:scale-110"
          />

          {/* Duration Badge */}
          <div
            className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm 
      px-2 py-1 rounded-md text-xs font-semibold text-white shadow-md"
          >
            {formatDuration(duration)}
          </div>

          {/* Hover Overlay */}
          <div
            className="absolute inset-0 bg-black/10 opacity-0 
      group-hover:opacity-100 transition-opacity duration-300"
          ></div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Title */}
        <h3
          onClick={() => navigate(`/video/${_id}`)}
          className="text-white font-semibold text-[15px] leading-tight line-clamp-2 
    mb-2 cursor-pointer transition-colors duration-200 
    group-hover:text-blue-400"
        >
          {title || "Untitled Video"}
        </h3>

        {/* Channel Name */}
        <p className="text-sm text-gray-400 mb-1">{channelName}</p>

        {/* Meta Info */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>{formatViews(views)} views</span>
          <span>•</span>
          <span>
            {createdAt
              ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
              : "some time ago"}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {/* Owner Buttons */}
          {isOwner && (
            <>
              <button
                onClick={triggerFileUpload}
                disabled={loading}
                className="px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 
          text-white transition shadow-sm disabled:opacity-50"
              >
                Update Thumbnail
              </button>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-700 
          text-white transition shadow-sm disabled:opacity-50"
              >
                Delete
              </button>

              <button
                onClick={handleTogglePublish}
                disabled={loading}
                className={`px-3 py-1 text-xs rounded text-white transition shadow-sm disabled:opacity-50 ${
                  published
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-yellow-600 hover:bg-yellow-700"
                }`}
              >
                {published ? "Unpublish" : "Publish"}
              </button>
            </>
          )}

          {/* User Buttons */}
          {user && (
            <div className="flex gap-2 mt-2 w-full">
              {/* Watch Later */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  isInWatchLater
                    ? handleRemoveFromWatchLater(_id)
                    : handleAddToWatchLater(_id);
                  setIsInWatchLater((prev) => !prev);
                }}
                className={`flex-1 py-2 rounded-md text-xs font-semibold transition 
          shadow-sm ${
            isInWatchLater
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          }`}
              >
                {isInWatchLater ? "Remove" : "Watch Later"}
              </button>

              {/* Playlist */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlaylistModal(true);
                }}
                className="py-2 px-3 rounded-md bg-purple-600 hover:bg-purple-700 
          text-xs text-white transition shadow-sm"
              >
                + Playlist
              </button>
            </div>
          )}
        </div>
      </div>

      {showPlaylistModal && (
        <PlaylistModal
          videoId={_id}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
};
