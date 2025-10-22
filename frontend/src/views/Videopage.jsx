import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { axiosInstance } from "../utility/axios";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "../context/UserContext";
import CommentSection from "../components/CommentSection";
import { toast } from "react-toastify";
import {
  FaThumbsUp,
  FaRegThumbsUp,
  FaEye,
  FaPlayCircle,
  FaUserCircle,
} from "react-icons/fa";
import { MdSubscriptions, MdOutlineSubscriptions } from "react-icons/md";

const Videopage = () => {
  const { videoId } = useParams();
  const { user } = useUser();

  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Toggle subscription
  const handleToggleSubscription = async () => {
    if (!user) return toast.error("Please log in to subscribe");

    try {
      const res = await axiosInstance.post(
        `/v1/subscription/toggle-subscription/${video.owner._id}`,
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

  // Toggle like
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

  // Fetch video details + recommended
  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/v1/video/c/${videoId}?userId=${user?._id}`
        );

        const videoData = response.data.data;

        if (!videoData.isPublished && videoData.owner?._id !== user?._id) {
          setError("This video is not published yet.");
          setLoading(false);
          return;
        }

        setVideo(videoData);

        // Fetch subscribers count
        const statsRes = await axiosInstance.get(
          `/v1/subscription/c/${videoData.owner._id}`, // fetch subscribers list
          { withCredentials: true }
        );
        setSubscribersCount(statsRes.data.data.length || 0);

        // Fetch subscription status for current user
        if (user?._id) {
          const subRes = await axiosInstance.get(
            `/v1/subscription/is-subscribed/${videoData.owner._id}`,
            { withCredentials: true }
          );
          setIsSubscribed(subRes.data.data.subscribed);
        }

        // Fetch likes separately
        const likesCount = await axiosInstance.get(
          `/v1/like/get-video-like/${videoId}`
        );
        const isLikedRes = await axiosInstance.get(
          `/v1/like/video/${videoId}?userId=${user?._id}`
        );
        setIsLiked(isLikedRes.data.isLiked);
        setLikeCount(likesCount.data.likeCount || 0);

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

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-neonBlue text-xl animate-pulse">
        <FaPlayCircle className="text-4xl mr-3 animate-bounce" /> Loading
        video...
      </div>
    );

  if (error || !video)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-400 text-xl">
        {error || "Video not found"}
      </div>
    );

  return (
    <div className="bg-[#050505] min-h-screen text-white pt-16 px-6 md:px-10 lg:px-20 font-poppins">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left: Main Video Section */}
        <div className="flex-1">
          <div className="aspect-video rounded-xl overflow-hidden mb-6 shadow-[0_0_20px_#00ffff44]">
            <video
              src={video.videoFile}
              controls
              autoPlay
              className="w-full h-full object-contain bg-[#0a0a0a]"
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-4 text-neonPink tracking-wide">
            {video.title}
          </h1>

          {/* Channel Info */}
          <div className="flex items-center justify-between bg-[#111] rounded-2xl p-4 mb-4 border border-[#00ffff33] hover:border-[#ff00ff66] transition-all duration-300">
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => navigate(`/c/${video.owner.username}`)}
            >
              {video.owner.avatar ? (
                <img
                  src={video.owner.avatar}
                  alt={video.owner.username}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#00ffff88] hover:shadow-[0_0_10px_#00ffff] transition"
                />
              ) : (
                <FaUserCircle className="text-5xl text-gray-400" />
              )}
              <div>
                <p className="text-white font-semibold text-lg">
                  {video.owner.fullname}
                </p>
                <p className="text-gray-400 text-sm">
                  {video.channelName} • {subscribersCount} subs
                </p>
              </div>
            </div>

            {video && (
              <button
                onClick={handleToggleSubscription}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-all duration-300 ${
                  !isSubscribed
                    ? "bg-[#ff00ff44] hover:bg-[#ff00ff88] text-white"
                    : "bg-[#222] border border-[#00ffff66] hover:bg-[#00ffff22]"
                }`}
              >
                {user ? (
                  isSubscribed ? (
                    <>
                      <MdOutlineSubscriptions /> Subscribed
                    </>
                  ) : (
                    <>
                      <MdSubscriptions /> Subscribe
                    </>
                  )
                ) : (
                  "Login to Subscribe"
                )}
              </button>
            )}
          </div>

          {/* Likes / Views */}
          <div className="flex gap-8 items-center mb-5 text-gray-300">
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium shadow-md transition-all ${
                isLiked
                  ? "bg-[#00ffff33] border border-[#00ffff] hover:bg-[#00ffff55]"
                  : "bg-[#1a1a1a] hover:bg-[#222]"
              }`}
            >
              {isLiked ? <FaThumbsUp /> : <FaRegThumbsUp />} {likeCount}
            </button>
            <div className="flex items-center gap-2">
              <FaEye /> {video.views || 0} views
            </div>
          </div>

          {/* Description */}
          <div className="bg-[#0a0a0a] border border-[#00ffff22] rounded-xl p-4 text-gray-300 shadow-inner shadow-[#00ffff11]">
            {video.description || "No description provided."}
          </div>

          {/* Comments */}
          <div className="mt-8">
            <CommentSection
              itemId={videoId}
              itemOwnerId={video.owner._id}
              itemType="video"
            />
          </div>
        </div>

        {/* Right: Recommended Videos */}
        <div className="lg:w-1/3">
          <h2 className="text-2xl font-semibold mb-4 text-neonBlue">
            Recommended
          </h2>
          <div className="space-y-4">
            {recommended.map((vid) => (
              <div
                key={vid._id}
                onClick={() => navigate(`/video/${vid._id}`)}
                className="flex gap-3 cursor-pointer bg-[#0a0a0a] border border-[#00ffff22] hover:border-[#ff00ff66] rounded-xl p-3 transition-all hover:shadow-[0_0_15px_#ff00ff44]"
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
                    {vid.channelName} • {vid.views} views •{" "}
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
