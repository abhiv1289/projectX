import React, { useEffect, useState } from "react";
import { axiosInstance } from "../utility/axios";
import { VideoCard } from "../components/VideoCard";

const WatchLater = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchLater = async () => {
      try {
        const res = await axiosInstance.get("/v1/video/list");
        setVideos(res.data.data || []);
      } catch (err) {
        console.error("Error loading watch later videos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchLater();
  }, []);

  // ⏳ Loading UI (same as trending)
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-white text-xl">
        Loading your saved videos...
      </div>
    );

  return (
    <div className="p-6 text-white min-h-screen bg-black">
      <h2 className="text-3xl font-bold mb-6 text-center neon-text">
        🕒 Watch Later
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {videos.length !== 0 ? (
          videos.map((video) => <VideoCard key={video._id} video={video} />)
        ) : (
          <p className="text-center col-span-full text-lg">
            You have no videos saved to watch later.
          </p>
        )}
      </div>
    </div>
  );
};

export default WatchLater;
