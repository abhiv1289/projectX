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
        setHistory(res.data.data);
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Watch History</h1>

      {history.length === 0 ? (
        <p className="text-gray-500">You haven’t watched any videos yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((video) => (
            <div
              key={video._id}
              className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Video clickable area */}
              <div
                onClick={() => goToVideo(video._id)}
                className="cursor-pointer"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h2 className="font-semibold text-lg mb-1">{video.title}</h2>
                  <p className="text-gray-600 text-sm mb-2">
                    {video.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span>{video.views} views</span>
                    <span>{video.duration.toFixed(2)}s</span>
                  </div>
                </div>
              </div>

              {/* Owner section - stop click propagation */}
              <div
                className="flex items-center p-4 border-t"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={video.owner.avatar}
                  alt={video.owner.fullname}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="text-gray-700">{video.owner.fullname}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
