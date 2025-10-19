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
      await axiosInstance.delete(`/${playlist._id}`);
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
    <div className="border rounded p-4 mb-3 bg-white">
      {isEditing ? (
        <>
          <input
            className="border w-full p-2 mb-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            className="border w-full p-2 mb-2 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-400 text-white px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div
              onClick={() => navigate(`/playlists/${playlist._id}`)}
              className="cursor-pointer"
            >
              <h3 className="font-bold text-lg">{playlist.name}</h3>
              <p className="text-sm text-gray-600">{playlist.description}</p>
              <p className="text-xs text-gray-400">
                {playlist.videos?.length || 0} videos
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-3 py-1 rounded"
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
