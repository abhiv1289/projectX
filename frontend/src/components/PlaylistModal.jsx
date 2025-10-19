import React, { useEffect, useState } from "react";
import { axiosInstance } from "../utility/axios";
import { toast } from "react-toastify";

const PlaylistModal = ({ videoId, onClose }) => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch user's playlists
  const fetchPlaylists = async () => {
    try {
      const res = await axiosInstance.get("/v1/playlist/");
      setPlaylists(res.data.data || []);
    } catch (error) {
      toast.error("Failed to load playlists", error);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleToggleVideo = async (playlist) => {
    const isInPlaylist = playlist.videos.some(
      (v) => v._id?.toString() === videoId
    );

    try {
      setLoading(true);
      if (isInPlaylist) {
        await axiosInstance.delete(`/${playlist._id}/videos`, {
          data: { videoId },
        });
        toast.info(`Removed from "${playlist.name}"`);
      } else {
        await axiosInstance.post(`/v1/playlist/${playlist._id}/videos`, {
          videoId,
        });
        toast.success(`Added to "${playlist.name}"`);
      }
      fetchPlaylists(); // refresh the list
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating playlist");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return toast.warn("Enter a name");
    try {
      await axiosInstance.post("/v1/playlist/create-playlist", {
        name: newPlaylistName,
      });
      toast.success("Playlist created!");
      setNewPlaylistName("");
      fetchPlaylists();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create playlist");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-96 max-w-full p-6 flex flex-col">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Save to Playlist
        </h2>

        <div className="flex-1 overflow-y-auto mb-4">
          {playlists.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No playlists found.
            </p>
          ) : (
            playlists.map((p) => {
              const isChecked = p.videos.some(
                (v) => v._id?.toString() === videoId
              );
              return (
                <label
                  key={p._id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleVideo(p)}
                    disabled={loading}
                    className="accent-purple-600 w-4 h-4"
                  />
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {p.name}
                  </span>
                </label>
              );
            })
          )}
        </div>

        <div className="border-t border-gray-300 dark:border-gray-700 pt-4">
          <input
            type="text"
            placeholder="New playlist name"
            className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 mb-2 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
          />
          <button
            onClick={handleCreatePlaylist}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded mb-2 transition"
          >
            Create Playlist
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 py-2 rounded transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;
