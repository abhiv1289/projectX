import React, { useEffect, useState, useRef, useCallback } from "react";
import { VideoCard } from "../components/VideoCard";
import { axiosInstance } from "../utility/axios.js";
import { FaPlay } from "react-icons/fa";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observer = useRef();

  const fetchVideos = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/v1/video/search", {
        params: {
          page: pageNumber,
          limit: 10,
        },
      });

      const { videos: fetchedVideos, totalPages } = response.data.data;

      setVideos((prev) => [...prev, ...fetchedVideos]);
      setHasMore(pageNumber < totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setLoading(false);
    }
  };

  const lastVideoRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    fetchVideos(page);
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-20 px-4 md:px-6 lg:px-8">
      {/* Subtle background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Videos
          </h1>
          <div className="h-[2px] w-24 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"></div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {videos.map((video, index) => {
            if (index === videos.length - 1) {
              return (
                <div ref={lastVideoRef} key={video._id}>
                  <VideoCard video={video} />
                </div>
              );
            } else {
              return <VideoCard key={video._id} video={video} />;
            }
          })}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-cyan-400">Loading more...</p>
          </div>
        )}

        {/* End of content */}
        {!hasMore && !loading && videos.length > 0 && (
          <div className="text-center py-12">
            <div className="inline-block bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl px-8 py-6">
              <FaPlay className="mx-auto h-8 w-8 text-cyan-400 mb-3" />
              <p className="text-lg font-semibold text-cyan-400">
                You've reached the end!
              </p>
              <p className="text-gray-400 text-sm mt-1">
                That's all for now 🎬
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && videos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-12 text-center max-w-md">
              <FaPlay className="mx-auto h-12 w-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold text-cyan-400 mb-2">
                No Videos Found
              </h3>
              <p className="text-gray-400">Check back later for new content!</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.5);
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #06b6d4, #a855f7);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #0891b2, #9333ea);
        }
      `}</style>
    </div>
  );
};

export default Home;
