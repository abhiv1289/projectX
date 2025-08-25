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
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video uploaded successfully!"));
});

export { publishAVideo };
