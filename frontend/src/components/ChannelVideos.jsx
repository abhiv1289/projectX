import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../utility/axios";
import { VideoCard } from "../components/VideoCard";
import { toast } from "react-toastify";

const ChannelVideos = () => {
  const { channelId } = useParams(); // from /channel/:channelId route
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Fetch videos
  const fetchVideos = async (pageNum = 1) => {
    if (!channelId) return;

    try {
      setLoading(true);
      const res = await axiosInstance.get(`/v1/dashboard/c/${channelId}`, {
        params: { page: pageNum, limit },
        withCredentials: true,
      });

      const data = res.data?.data?.Videos || [];

      console.log("in channel videos", res);

      if (pageNum === 1) {
        setVideos(data);
      } else {
        setVideos((prev) => [...prev, ...data]);
      }

      if (data.length < limit) {
        setHasMore(false);
      }
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
    <div className="min-h-screen bg-gray-950 text-white py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <h1 className="text-2xl font-bold mb-6 text-center sm:text-left">
          Channel Videos
        </h1>

        {/* Videos Grid */}
        {videos.length === 0 && !loading ? (
          <div className="text-gray-400 text-center mt-20">
            No videos found for this channel.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && videos.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 rounded bg-red-600 hover:bg-red-700 transition font-semibold"
            >
              Load More
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center mt-8 text-gray-400">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelVideos;
