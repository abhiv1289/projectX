import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { axiosInstance } from "../utility/axios";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "../context/UserContext";
import CommentSection from "../components/CommentSection";
import { toast } from "react-toastify";

const Videopage = () => {
  const { videoId } = useParams();
  const { user } = useUser();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);

  // ✅ Like feature state
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Toggle subscription
  const handleToggleSubscription = async () => {
    if (!user) return toast.error("Please log in to subscribe");

    try {
      const res = await axiosInstance.post(
        `/v1/subscription/toggle-subscription/${video.owner}`,
        {},
        { withCredentials: true }
      );
      toast.success(res.data.message);
      setIsSubscribed((prev) => !prev);
      setSubscribersCount((count) =>
        res.data.message.includes("Subscribed") ? count + 1 : count - 1
      );
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to toggle subscription"
      );
    }
  };

  // ✅ Toggle like
  const handleToggleLike = async () => {
    if (!user) return toast.error("Please log in to like the video");

    try {
      const res = await axiosInstance.post(
        `/v1/video/toggle-like/${videoId}`,
        {},
        { withCredentials: true }
      );

      const { isLiked: newIsLiked, likeCount: newLikeCount } =
        res.data.data || {};

      if (typeof newIsLiked === "boolean") setIsLiked(newIsLiked);
      if (typeof newLikeCount === "number") setLikeCount(newLikeCount);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to toggle like");
    }
  };

  // ✅ Fetch video details + recommended
  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/v1/video/c/${videoId}`);
        const videoData = response.data.data;

        if (!videoData.isPublished && videoData.owner?._id !== user?._id) {
          setError("This video is not published yet.");
          setLoading(false);
          return;
        }

        setVideo(videoData);

        // Fetch channel stats
        try {
          const statsRes = await axiosInstance.get(
            `/v1/dashboard/${videoData.owner}`,
            { withCredentials: true }
          );
          setSubscribersCount(statsRes.data.data.totalSubscribers || 0);
          setIsSubscribed(statsRes.data.data.isSubscribed);
        } catch (err) {
          console.error("Failed to load subscription info", err);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching video details:", error);
        setError("Failed to load video");
        setLoading(false);
      }
    };

    const fetchRecommendedVideos = async () => {
      try {
        const res = await axiosInstance.get(`/v1/video/search?page=1&limit=5`);
        const publishedVideos = (res.data.data.videos || []).filter(
          (vid) => vid.isPublished
        );
        setRecommended(publishedVideos);
      } catch (err) {
        console.error("Error fetching recommended:", err);
      }
    };

    fetchVideoDetails();
    fetchRecommendedVideos();
  }, [videoId, user?._id]);

  // ✅ Loading/Error states
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading video...
      </div>
    );

  if (error || !video)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error || "Video not found"}
      </div>
    );

  return (
    <div className="bg-black min-h-screen text-white pt-16 px-6 md:px-10 lg:px-20">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left: Main Video Section */}
        <div className="flex-1">
          <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden mb-4">
            <video
              src={video.videoFile}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold mb-2">{video.title}</h1>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-400 text-sm mb-4 gap-3">
            <div className="flex items-center gap-3">
              <img
                src={video.owner.avatar}
                alt={video.owner.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-white font-semibold">
                  {video.owner.fullname}
                </p>
                <p className="text-xs text-gray-400">
                  {subscribersCount} subscribers
                </p>
              </div>
              {user?._id !== video.owner._id && (
                <button
                  onClick={handleToggleSubscription}
                  className={`ml-3 px-4 py-1 rounded font-semibold transition ${
                    !isSubscribed
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {!isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              )}
            </div>

            <div className="flex gap-3 items-center">
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
              <span className="text-gray-400">{likeCount}</span>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-4 text-gray-300 whitespace-pre-line">
            {video.description || "No description provided."}
          </div>
        </div>

        {/* Comment Section */}
        <CommentSection
          itemId={videoId}
          itemOwnerId={video.owner._id}
          itemType="video"
        />

        {/* Right: Recommended Videos */}
        <div className="lg:w-1/3">
          <h2 className="text-lg font-semibold mb-4">Recommended</h2>
          <div className="space-y-4">
            {recommended.map((vid) => (
              <div
                key={vid._id}
                onClick={() => (window.location.href = `/video/${vid._id}`)}
                className="flex gap-3 cursor-pointer hover:bg-gray-900 rounded-lg p-2 transition"
              >
                <img
                  src={vid.thumbnail}
                  alt={vid.title}
                  className="w-40 h-24 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-sm line-clamp-2 text-white">
                    {vid.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {vid.views} views •{" "}
                    {formatDistanceToNow(new Date(vid.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Videopage;
