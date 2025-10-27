import React, { useEffect, useState } from "react";
import { axiosInstance } from "../utility/axios";
import { VideoCard } from "../components/VideoCard";

const WatchLater = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchWatchLater = async () => {
      const res = await axiosInstance.get("/v1/video/list");
      setVideos(res.data.data);
    };
    fetchWatchLater();
  }, []);

  return (
    <div className="p-6 text-white min-h-screen bg-black">
      <h2 className="text-3xl font-bold mb-6 text-center">🕒 Watch Later</h2>

      {videos.length === 0 ? (
        <p className="text-center text-gray-400">No videos saved yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchLater;
