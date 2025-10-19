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

  if (!playlist) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <h1 className="text-2xl font-bold mb-2">{playlist.name}</h1>
      <p className="text-gray-600 mb-4">{playlist.description}</p>
      {playlist.videos.length === 0 ? (
        <p>No videos in this playlist.</p>
      ) : (
        playlist.videos.map((v) => (
          <div
            key={v._id}
            className="flex items-center justify-between border p-2 rounded mb-2"
          >
            <div
              className="flex items-center gap-2"
              onClick={() => navigate(`/video/${v._id}`)}
            >
              <img
                src={v.thumbnail}
                alt={v.title}
                className="w-16 h-10 rounded object-cover"
              />
              <p>{v.title}</p>
            </div>
            <button
              onClick={() => handleRemoveVideo(v._id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Remove
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default PlaylistDetails;
