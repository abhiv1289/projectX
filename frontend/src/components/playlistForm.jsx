import React, { useState } from "react";
import { axiosInstance } from "../utility/axios";
import { toast } from "react-toastify";

const PlaylistForm = ({ refresh }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.warn("Playlist name cannot be empty!");
    try {
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
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
      <input
        className="border w-full p-2 mb-2 rounded"
        placeholder="Playlist Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        className="border w-full p-2 mb-2 rounded"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Create
      </button>
    </form>
  );
};

export default PlaylistForm;
