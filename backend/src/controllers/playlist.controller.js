import mongoose from "mongoose";
import Playlist from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || name.trim().length === 0) {
    throw new ApiError(400, "Playlist name cannot be empty!");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user?._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist created successfully!"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find({
    owner: req.user?._id,
  })
    .populate("videos", "title thumbnail duration")
    .sort({ createdAt: -1 });

  if (!playlists || playlists.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No playlists found!"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "playlists fetched successfully!"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "Provide a valid playlistId!");
  }

  const playlist = await Playlist.findById(playlistId)
    .populate("videos", "title thumbnail duration")
    .populate("owner", "username avatar");

  if (!playlist) {
    throw new ApiError(404, "Playlist not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully!"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { videoId } = req.body;

  if (!videoId || !playlistId) {
    throw new ApiError(400, "Provide a valid videoid and playlistid!");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found!");
  }

  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already in playlist!");
  }

  playlist.videos.push(videoId);

  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "video Added successfully!"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { videoId } = req.body;

  if (!videoId || !playlistId) {
    throw new ApiError(400, "Provide valid playlist and video Id");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found!");
  }

  const isVideoPresent = playlist.videos.some(
    (video) => video.toString() === videoId
  );

  if (!isVideoPresent) {
    throw new ApiError(404, "Video not present in the playlist!");
  }

  const updatedVideos = playlist.videos.filter(
    (video) => video.toString() !== videoId
  );

  playlist.videos = updatedVideos;

  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "video removed from the playlist successfully!"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "Provide a valid playlistId!");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found!");
  }

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully!")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!playlistId) {
    throw new ApiError(400, "Provide a valid playlistId");
  }

  if (!name || name.trim().length === 0) {
    throw new ApiError(400, "Playlist name cannot be empty!");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name,
        description: description,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedPlaylist) {
    throw new ApiError(404, "Playlist not found!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "playlist updated successfully!")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
