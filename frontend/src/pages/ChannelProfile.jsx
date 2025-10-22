import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { axiosInstance } from "../utility/axios";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";
import { MdSubscriptions, MdOutlineSubscriptions } from "react-icons/md";
import { FaUserCircle, FaVideo, FaEnvelope } from "react-icons/fa";

const ChannelProfile = () => {
  const { username } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch channel profile + subscription info
  useEffect(() => {
    const fetchChannel = async () => {
      try {
        setIsLoading(true);

        // 1️⃣ Fetch channel data
        const res = await axiosInstance.get(`/v1/auth/c/${username}`);
        const channelData = res.data.data;
        setData(channelData);

        console.log("channeldata:", channelData);

        setSubscribersCount(channelData.subscribersCount || 0);

        // 3️⃣ Fetch subscription status for logged-in user (new route)
        setIsSubscribed(channelData.isSubscribed);

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load channel data!");
        toast.error("Failed to load channel data!");
        setIsLoading(false);
      }
    };

    fetchChannel();
  }, [username, user?._id]);

  // Toggle subscription
  const handleSubscribe = async () => {
    if (!user) return toast.error("Please log in to subscribe");

    try {
      const res = await axiosInstance.post(
        `/v1/subscription/toggle-subscription/${data._id}`,
        {},
        { withCredentials: true }
      );

      const subscribedNow = res.data.message.includes("Subscribed");
      setIsSubscribed(subscribedNow);
      setSubscribersCount((prev) => (subscribedNow ? prev + 1 : prev - 1));

      toast.success(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong!");
    }
  };

  const handleViewVideos = () => {
    navigate(`/channel/${data._id}`);
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen text-neonBlue text-lg animate-pulse">
        Loading Channel...
      </div>
    );

  if (error || !data)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-400 text-lg">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-16 px-6 md:px-12 lg:px-20 font-poppins">
      <div className="max-w-6xl mx-auto bg-[#0a0a0a] rounded-2xl border border-[#00ffff33] shadow-[0_0_20px_#00ffff22] overflow-hidden transition-all duration-500 hover:shadow-[0_0_25px_#ff00ff44]">
        {/* Cover Image */}
        <div className="relative w-full h-60">
          {data.coverImage ? (
            <img
              src={data.coverImage}
              alt="Cover"
              className="w-full h-full object-cover opacity-90"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#111] text-gray-400">
              No Cover Image
            </div>
          )}

          {/* Avatar */}
          <div className="absolute -bottom-16 left-8">
            {data.avatar ? (
              <img
                src={data.avatar}
                alt="Avatar"
                className="w-32 h-32 rounded-full border-4 border-[#00ffff99] object-cover shadow-[0_0_20px_#00ffff55] hover:shadow-[0_0_25px_#ff00ff88] transition-all"
              />
            ) : (
              <FaUserCircle className="text-8xl text-gray-500" />
            )}
          </div>
        </div>

        {/* Channel Info Section */}
        <div className="mt-20 px-8 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold text-neonPink tracking-wide">
              {data.fullname}
            </h2>
            <p className="text-gray-400">@{data.username}</p>
            <p className="mt-2 text-sm text-gray-500">
              Joined {formatDistanceToNow(new Date(data.createdAt))} ago
            </p>
            <div className="mt-3 flex flex-wrap gap-6 text-gray-300">
              <span className="text-neonBlue font-semibold">
                {subscribersCount}
              </span>{" "}
              Subscribers
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            {
              <button
                onClick={handleSubscribe}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold border transition-all duration-300 ${
                  isSubscribed
                    ? "bg-[#1a1a1a] border-[#00ffff55] hover:bg-[#00ffff22]"
                    : "bg-[#ff00ff44] hover:bg-[#ff00ff88] border-none"
                }`}
              >
                {isSubscribed ? (
                  <>
                    <MdOutlineSubscriptions /> Subscribed
                  </>
                ) : (
                  <>
                    <MdSubscriptions /> Subscribe
                  </>
                )}
              </button>
            }

            <button
              onClick={handleViewVideos}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#00ffff33] hover:bg-[#00ffff66] border border-[#00ffff55] font-semibold transition-all duration-300"
            >
              <FaVideo /> View Videos
            </button>
          </div>
        </div>

        {/* Optional Email Info */}
        {user?._id === data._id && (
          <div className="px-8 pb-8 text-gray-400 flex items-center gap-2 text-sm">
            <FaEnvelope className="text-neonBlue" /> {data.email}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelProfile;
