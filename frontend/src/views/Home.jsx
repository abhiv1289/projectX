/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { VideoCard } from "../components/VideoCard";
import { axiosInstance } from "../utility/axios.js";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observer = useRef();

  // Fetch videos from backend
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

      // Append new videos
      setVideos((prev) => [...prev, ...fetchedVideos]);
      setHasMore(pageNumber < totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setLoading(false);
    }
  };

  // Intersection Observer for infinite scroll
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
    <div className="min-h-screen bg-black text-white pt-16 px-6">
      <h1 className="text-2xl font-bold mb-6">Recommended Videos</h1>

      {/* Grid Layout for videos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video, index) => {
          if (index === videos.length - 1) {
            // Attach observer to last video
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
        <div className="text-center py-6 text-gray-400">Loading more...</div>
      )}

      {/* No more videos */}
      {!hasMore && !loading && videos.length > 0 && (
        <div className="text-center py-6 text-gray-500">
          You’ve reached the end 🎬
        </div>
      )}

      {/* Empty state */}
      {!loading && videos.length === 0 && (
        <div className="text-center py-6 text-gray-500">No videos found</div>
      )}
    </div>
  );
};

export default Home;
