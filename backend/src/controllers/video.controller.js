import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";
import Comment from "../models/comment.model.js";
import Like from "../models/like.model.js";
import User from "../models/user.model.js";
import connectDB from "../config/database.js";

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, videoUrl, thumbnailUrl, duration } = req.body;

  if (!title || !description || !videoUrl || !thumbnailUrl || !duration) {
    throw new ApiError(
      400,
      "title, description, videoUrl, thumbnailUrl, and duration are required!"
    );
  }

  const video = await Video.create({
    videoFile: videoUrl,
    thumbnail: thumbnailUrl,
    title,
    description,
    duration,
    owner: req.user?._id,
    channelName: req.user?.fullname,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video uploaded successfully!"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required!");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found!");
  }

  await Comment.deleteMany({ video: videoId });

  await Like.deleteMany({ video: videoId });

  await Video.deleteOne({ _id: videoId });

  return res
    .status(200)
    .json(new ApiResponse(200, "Video deleted successfully!"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Not a valid video id!");
  }

  const thumbnailLocalFilePath = req.file?.path;

  if (!thumbnailLocalFilePath) {
    throw new ApiError(400, "Video is required!");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalFilePath);

  if (!thumbnail) {
    throw new ApiError(500, "Error uploading the video!");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: thumbnail.secure_url,
      },
    },
    {
      new: true,
    }
  );

  if (!video) {
    throw new ApiError(400, "Video not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Thumbnail updated successfully!"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Not a valid video id!");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found!");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedVideo) {
    throw new ApiError(400, "Video not found!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updateVideo,
        "isPublished status changed successfully!"
      )
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { userId } = req.query;

  if (!videoId) {
    throw new ApiError(400, "Not a valid video id!");
  }

  const video = await Video.findById(videoId).populate(
    "owner",
    "avatar fullname username"
  );

  if (!video) {
    throw new ApiError(400, "Video not found!");
  }

  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    if (!video.viewedBy.includes(userId)) {
      video.views += 1;
      video.viewedBy.push(userId);
      await video.save();
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully!"));
});

const getAllVideos = asyncHandler(async (req, res) => {
  await connectDB();

  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;

  const skip = (pageNumber - 1) * limitNumber;

  if (sortType && !["asc", "desc"].includes(sortType.toLowerCase())) {
    throw new ApiError(400, "sortType must be either 'asc' or 'desc'");
  }

  const allowedSortFields = ["createdAt", "views", "likes"];
  if (sortBy && !allowedSortFields.includes(sortBy)) {
    throw new ApiError(400, "Invalid sortBy field");
  }

  if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  let filter = {};

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  if (userId) {
    filter.owner = userId;
  }

  let sort = { createdAt: -1 };

  if (sortBy) {
    sort = {
      [sortBy]: sortType === "asc" ? 1 : -1,
    };
  }

  const videos = await Video.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNumber);

  const totalVideos = await Video.countDocuments(filter);
  const totalPages = Math.ceil(totalVideos / limitNumber);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos, totalVideos, totalPages, page: pageNumber },
        "videos fetched successfully!"
      )
    );
});

const getTrendingVideos = asyncHandler(async (req, res) => {
  const trendingVideos = await Video.find({ isPublished: true })
    .sort({ views: -1 })
    .limit(10);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { trendingVideos },
        "Trending videos fetched successfully!"
      )
    );
});

const addToWatchLater = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { videoId } = req.body;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  const user = await User.findById(userId);

  if (user.watchLater.includes(videoId)) {
    throw new ApiError(400, "Video already in watch later list!");
  }

  user.watchLater.push(videoId);
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Added to Watch Later successfully!"));
});

const removeFromWatchLater = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { videoId } = req.body;

  await User.findByIdAndUpdate(
    userId,
    {
      $pull: {
        watchLater: videoId,
      },
    },
    { new: true }
  );

  res.status(200).json(new ApiResponse(200, {}, "Removed From Watch Later!"));
});

const getWatchLaterVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).populate("watchLater");

  res
    .status(200)
    .json(new ApiResponse(200, user.watchLater, "watch later videos fetched!"));
});

export {
  publishAVideo,
  deleteVideo,
  updateVideo,
  togglePublishStatus,
  getVideoById,
  getAllVideos,
  getTrendingVideos,
  getWatchLaterVideos,
  addToWatchLater,
  removeFromWatchLater,
};
