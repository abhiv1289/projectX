import React, { useState } from "react";
import { axiosInstance } from "../utility/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const PlaylistCard = ({ playlist, refresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description || "");
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/v1/playlist/${playlist._id}`);
      toast.success("Playlist deleted!");
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting playlist");
    }
  };

  const handleUpdate = async () => {
    try {
      await axiosInstance.patch(
        `/v1/playlist/update-playlist/${playlist._id}`,
        {
          name,
          description,
        }
      );
      toast.success("Playlist updated!");
      setIsEditing(false);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating playlist");
    }
  };

  return (
    <div className="bg-gray-900/50 border border-pink-500 rounded-lg p-4 mb-4 hover:shadow-pink-500 hover:shadow-lg transition">
      {isEditing ? (
        <>
          <input
            className="w-full p-2 mb-2 rounded bg-gray-800 text-white border border-blue-500 focus:ring-2 focus:ring-pink-500 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            className="w-full p-2 mb-2 rounded bg-gray-800 text-white border border-blue-500 focus:ring-2 focus:ring-pink-500 outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white neon-button transition"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-500 text-white neon-button transition"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div
              onClick={() => navigate(`/playlists/${playlist._id}`)}
              className="cursor-pointer"
            >
              <h3 className="text-lg font-bold text-green-400 neon-text">
                {playlist.name}
              </h3>
              <p className="text-sm text-gray-400">{playlist.description}</p>
              <p className="text-xs text-gray-500">
                {playlist.videos?.length || 0} videos
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white neon-button transition"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white neon-button transition"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PlaylistCard;
