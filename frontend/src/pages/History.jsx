import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../utility/axios";

const History = () => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axiosInstance.get("/v1/auth/history");
        setHistory(res.data.data || []);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };
    fetchHistory();
  }, []);

  const goToVideo = (videoId) => {
    navigate(`/video/${videoId}`);
  };

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden pt-20">
      {/* 🔥 Neon Glow Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-20 p-6 text-white">
        <h1 className="text-3xl font-bold mb-6 text-center neon-text">
          👁️ Watch History
        </h1>

        {history.length === 0 ? (
          <p className="text-center text-gray-400 mt-10 text-lg">
            You haven’t watched any videos yet.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {history.map((video) => (
              <div
                key={video._id}
                className="bg-gray-900 border border-blue-500/30 rounded-xl shadow-lg hover:shadow-blue-500/40 transition cursor-pointer"
                onClick={() => goToVideo(video._id)}
              >
                {/* Thumbnail */}
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-40 object-cover rounded-t-xl"
                />

                {/* Info Section */}
                <div className="p-4">
                  <h2 className="font-semibold text-lg mb-1 text-green-400 neon-text">
                    {video.title}
                  </h2>

                  <p className="text-gray-300 text-sm line-clamp-2 mb-2">
                    {video.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{video.views} views</span>
                    <span>{video.duration.toFixed(2)}s</span>
                  </div>
                </div>

                {/* Owner */}
                <div
                  className="flex items-center gap-2 p-4 border-t border-blue-500/20 bg-gray-900/80"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={video.owner.avatar}
                    alt={video.owner.fullname}
                    className="w-8 h-8 rounded-full border border-pink-500"
                  />
                  <span className="text-gray-300 text-sm">
                    {video.owner.fullname}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
