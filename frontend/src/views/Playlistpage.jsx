import React, { useEffect, useState } from "react";
import { axiosInstance } from "../utility/axios";
import { toast } from "react-toastify";
import PlaylistForm from "../components/playlistForm";
import PlaylistCard from "../components/PlaylistCard";
import { MdPlaylistPlay } from "react-icons/md";

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/v1/playlist/");
      setPlaylists(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching playlists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-20 px-4 md:px-6 lg:px-8">
      {/* Subtle background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MdPlaylistPlay className="h-8 w-8 text-cyan-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              My Playlists
            </h1>
          </div>
          <div className="h-[2px] w-24 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"></div>
        </div>

        {/* Playlist Form */}
        <div className="mb-8">
          <PlaylistForm refresh={fetchPlaylists} />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-cyan-400">Loading playlists...</p>
          </div>
        ) : playlists.length > 0 ? (
          /* Playlists Grid */
          <div className="space-y-4">
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist._id}
                playlist={playlist}
                refresh={fetchPlaylists}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-12 text-center max-w-md">
              <MdPlaylistPlay className="mx-auto h-16 w-16 text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold text-cyan-400 mb-2">
                No Playlists Yet
              </h3>
              <p className="text-gray-400">
                Create your first playlist to get started!
              </p>
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

export default PlaylistsPage;
