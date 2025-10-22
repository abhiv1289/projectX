import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../utility/axios";
import { VideoCard } from "../components/VideoCard";
import { toast } from "react-toastify";

const ChannelVideos = () => {
  const { channelId } = useParams();
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchVideos = async (pageNum = 1) => {
    if (!channelId) return;

    try {
      setLoading(true);
      const res = await axiosInstance.get(`/v1/dashboard/c/${channelId}`, {
        params: { page: pageNum, limit },
        withCredentials: true,
      });

      const data = res.data?.data?.Videos || [];

      if (pageNum === 1) {
        setVideos(data);
      } else {
        setVideos((prev) => [...prev, ...data]);
      }

      if (data.length < limit) setHasMore(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setVideos([]);
    setPage(1);
    setHasMore(true);
    fetchVideos(1);
  }, [channelId]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchVideos(nextPage);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        {/* Heading */}
        <h1 className="text-3xl font-bold mb-6 text-center text-green-400 neon-text sm:text-left">
          Channel Videos
        </h1>

        {/* Videos Grid */}
        {videos.length === 0 && !loading ? (
          <div className="text-red-500 text-center mt-20">
            No videos found for this channel.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-gray-800 rounded-lg border border-blue-500 hover:shadow-lg hover:shadow-blue-500 transition-shadow duration-300"
              >
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && videos.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={handleLoadMore}
              className="px-6 py-2 rounded bg-pink-500 hover:bg-pink-600 transition font-semibold neon-button"
            >
              Load More
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center mt-8 text-cyan-400 animate-pulse">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelVideos;
