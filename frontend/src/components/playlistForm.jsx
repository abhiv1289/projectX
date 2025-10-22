import React, { useState } from "react";
import { axiosInstance } from "../utility/axios";
import { toast } from "react-toastify";
import { MdPlaylistAdd } from "react-icons/md";

const PlaylistForm = ({ refresh }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.warn("Playlist name cannot be empty!");

    try {
      setLoading(true);
      await axiosInstance.post("/v1/playlist/create-playlist", {
        name,
        description,
      });
      toast.success("Playlist created successfully!");
      setName("");
      setDescription("");
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating playlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl blur opacity-20"></div>

      <div className="relative bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <MdPlaylistAdd className="h-6 w-6 text-cyan-400" />
          <h3 className="text-lg font-semibold text-cyan-400">
            Create New Playlist
          </h3>
        </div>

        <div className="space-y-4">
          {/* Playlist Name Input */}
          <div className="group">
            <label className="block text-sm font-medium text-cyan-400 mb-2">
              Playlist Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
              placeholder="My Awesome Playlist"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description Textarea */}
          <div className="group">
            <label className="block text-sm font-medium text-cyan-400 mb-2">
              Description <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 resize-none"
              placeholder="Add a description for your playlist..."
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="relative w-full py-3 px-4 font-semibold text-white rounded-lg overflow-hidden group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <MdPlaylistAdd className="w-5 h-5" />
                  Create Playlist
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaylistForm;
