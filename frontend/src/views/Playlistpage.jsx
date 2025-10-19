import React, { useEffect, useState } from "react";
import { axiosInstance } from "../utility/axios";
import { toast } from "react-toastify";
import PlaylistForm from "../components/playlistForm";
import PlaylistCard from "../components/PlaylistCard";
const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState([]);

  const fetchPlaylists = async () => {
    try {
      const res = await axiosInstance.get("/v1/playlist/");
      setPlaylists(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching playlists");
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">My Playlists</h1>
      <PlaylistForm refresh={fetchPlaylists} />
      {playlists.length > 0 ? (
        playlists.map((playlist) => (
          <PlaylistCard
            key={playlist._id}
            playlist={playlist}
            refresh={fetchPlaylists}
          />
        ))
      ) : (
        <p className="text-gray-500">No playlists yet.</p>
      )}
    </div>
  );
};

export default PlaylistsPage;
