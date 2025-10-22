import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../utility/axios";
import { formatDistanceToNow } from "date-fns";

const Searchpage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParam = new URLSearchParams(location.search).get("query") || "";

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVideos = async (term) => {
    if (!term.trim()) {
      setVideos([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/v1/video/search`, {
        params: { query: term, limit: 20 },
      });
      setVideos(data.data.videos || []);
    } catch (err) {
      console.error(err);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(queryParam);
  }, [queryParam]);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      {/* Loading */}
      {loading && (
        <p className="text-cyan-400 text-center mb-4 animate-pulse">
          Searching...
        </p>
      )}

      {/* No results */}
      {!loading && videos.length === 0 && (
        <p className="text-red-500 text-center mb-4">No results found.</p>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos
          .filter((video) => video.isPublished)
          .map((video) => (
            <div
              key={video._id}
              className="cursor-pointer bg-gray-800 rounded-lg overflow-hidden border border-blue-500 hover:shadow-lg hover:shadow-blue-500 transition-shadow duration-300"
              onClick={() => navigate(`/video/${video._id}`)}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-40 object-cover border-b border-pink-500"
              />
              <div className="p-3">
                <h3 className="font-semibold text-green-400 hover:text-cyan-400">
                  {video.title}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  {video.views} views •{" "}
                  {formatDistanceToNow(new Date(video.createdAt))} ago
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Searchpage;
