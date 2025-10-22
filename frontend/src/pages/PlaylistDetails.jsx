import React, { useEffect, useState } from "react";
import { axiosInstance } from "../utility/axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const PlaylistDetails = () => {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const navigate = useNavigate();

  const fetchPlaylist = async () => {
    try {
      const res = await axiosInstance.get(`/v1/playlist/${playlistId}`);
      setPlaylist(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching playlist");
    }
  };

  const handleRemoveVideo = async (videoId) => {
    try {
      await axiosInstance.delete(`/v1/playlist/${playlistId}/videos`, {
        data: { videoId },
      });
      toast.success("Video removed!");
      fetchPlaylist();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error removing video");
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, []);

  if (!playlist)
    return (
      <p className="text-cyan-400 text-center mt-10 animate-pulse">
        Loading...
      </p>
    );

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-gray-900 rounded-lg shadow-lg border border-gray-700">
      {/* Playlist Header */}
      <h1 className="text-3xl font-bold text-green-400 mb-2 neon-text">
        {playlist.name}
      </h1>
      <p className="text-gray-400 mb-6">{playlist.description}</p>

      {/* Videos List */}
      {playlist.videos.length === 0 ? (
        <p className="text-red-500 text-center">No videos in this playlist.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {playlist.videos.map((v) => (
            <div
              key={v._id}
              className="flex items-center justify-between p-3 border border-blue-500 rounded-lg hover:shadow-lg hover:shadow-blue-500 transition-shadow duration-300 cursor-pointer bg-gray-800"
            >
              <div
                className="flex items-center gap-3"
                onClick={() => navigate(`/video/${v._id}`)}
              >
                <img
                  src={v.thumbnail}
                  alt={v.title}
                  className="w-20 h-12 rounded-md object-cover border border-pink-500"
                />
                <p className="text-cyan-400 font-medium hover:text-green-400">
                  {v.title}
                </p>
              </div>
              <button
                onClick={() => handleRemoveVideo(v._id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors duration-300"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistDetails;
