import React, { useEffect, useState } from "react";
import { axiosInstance } from "../utility/axios";
import { toast } from "react-toastify";
import { VideoCard } from "../components/VideoCard";

const Trending = () => {
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧠 Fetch Trending Videos
  useEffect(() => {
    const fetchTrendingVideos = async () => {
      try {
        const res = await axiosInstance.get("/v1/video/trending");
        setTrendingVideos(res.data?.data?.trendingVideos || []);
      } catch (err) {
        toast.error("Failed to load trending videos");
        console.error("Error fetching trending videos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingVideos();
  }, []);

  // 🧩 Render
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-white text-xl">
        Loading trending videos...
      </div>
    );

  if (!trendingVideos.length)
    return (
      <div className="text-center text-gray-400 mt-10 text-lg">
        No trending videos found.
      </div>
    );

  return (
    <div className="p-6 text-white min-h-screen bg-black">
      <h2 className="text-3xl font-bold mb-6 text-center neon-text">
        🔥 Trending Videos
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {trendingVideos.map((video) => (
          <VideoCard
            key={video._id}
            video={video}
            onVideoDeleted={(id) =>
              setTrendingVideos((prev) => prev.filter((v) => v._id !== id))
            }
            onVideoUpdated={(updatedVideo) =>
              setTrendingVideos((prev) =>
                prev.map((v) => (v._id === updatedVideo._id ? updatedVideo : v))
              )
            }
          />
        ))}
      </div>
    </div>
  );
};

export default Trending;
