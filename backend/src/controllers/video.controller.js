import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "title and description are required!");
  }

  const videoLocalFilePath = req.files?.videoFile?.[0]?.path;
  const thumbnailFilePath = req.files?.thumbnail?.[0]?.path;

  if (!thumbnailFilePath) {
    throw new ApiError(400, "Please upload a thumbnail!");
  }

  if (!videoLocalFilePath) {
    throw new ApiError(400, "Please upload a video!");
  }

  const Uploadedvideo = await uploadOnCloudinary(videoLocalFilePath);

  const UploadedThumbnail = await uploadOnCloudinary(thumbnailFilePath);

  if (!Uploadedvideo.url || !UploadedThumbnail.url) {
    throw new ApiError(400, "Error uploading the video!");
  }

  const video = await Video.create({
    videoFile: Uploadedvideo.url,
    thumbnail: UploadedThumbnail.url,
    title,
    description,
    duration: Uploadedvideo.duration,
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
        thumbnail: thumbnail.url,
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

  if (!videoId) {
    throw new ApiError(400, "Not a valid video id!");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!video) {
    throw new ApiError(400, "Video not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully!"));
});

const getAllVideos = asyncHandler(async (req, res) => {
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

export {
  publishAVideo,
  deleteVideo,
  updateVideo,
  togglePublishStatus,
  getVideoById,
  getAllVideos,
};
