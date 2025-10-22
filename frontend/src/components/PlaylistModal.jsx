import React, { useEffect, useState } from "react";
import { axiosInstance } from "../utility/axios";
import { toast } from "react-toastify";
import { MdPlaylistAdd, MdClose, MdCheck } from "react-icons/md";
import { IoMdCheckmarkCircle } from "react-icons/io";

const PlaylistModal = ({ videoId, onClose }) => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [loading, setLoading] = useState(false);

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
      fetchPlaylists();
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-md animate-[fadeIn_0.3s_ease-out]">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30"></div>

        <div className="relative bg-gray-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative px-6 py-4 border-b border-cyan-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MdPlaylistAdd className="h-6 w-6 text-cyan-400" />
                <h2 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Save to Playlist
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-cyan-500/10 transition-all duration-200 hover:scale-110 group"
              >
                <MdClose className="h-5 w-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
              </button>
            </div>
          </div>

          {/* Playlist List */}
          <div className="px-6 py-4 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
            {playlists.length === 0 ? (
              <div className="text-center py-8">
                <MdPlaylistAdd className="mx-auto h-12 w-12 text-gray-600 mb-2" />
                <p className="text-gray-400 text-sm">No playlists found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {playlists.map((p) => {
                  const isChecked = p.videos.some(
                    (v) => v._id?.toString() === videoId
                  );
                  return (
                    <label
                      key={p._id}
                      className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-all duration-200 border border-transparent hover:border-cyan-500/20"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleVideo(p)}
                          disabled={loading}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                            isChecked
                              ? "bg-gradient-to-r from-cyan-500 to-purple-500 border-cyan-500"
                              : "border-gray-600 group-hover:border-cyan-500/50"
                          }`}
                        >
                          {isChecked && (
                            <MdCheck className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                      <span
                        className={`font-medium transition-colors ${
                          isChecked
                            ? "text-cyan-400"
                            : "text-gray-300 group-hover:text-white"
                        }`}
                      >
                        {p.name}
                      </span>
                      {isChecked && (
                        <IoMdCheckmarkCircle className="ml-auto h-5 w-5 text-cyan-400" />
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Create New Playlist */}
          <div className="px-6 py-4 border-t border-cyan-500/20 space-y-3">
            <div className="group">
              <input
                type="text"
                placeholder="Create new playlist..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreatePlaylist()}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreatePlaylist}
                className="flex-1 relative py-2.5 px-4 font-medium text-white rounded-lg overflow-hidden group transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <MdPlaylistAdd className="w-4 h-4" />
                  Create
                </span>
              </button>

              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 font-medium rounded-lg border border-gray-700 hover:bg-gray-800/50 hover:border-cyan-500/30 transition-all duration-200 text-gray-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Custom scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </div>
  );
};

export default PlaylistModal;
