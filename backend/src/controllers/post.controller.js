import mongoose from "mongoose";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createPost = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Provide some content!");
  }

  const filesPaths = req.files?.media?.map((file) => file.path) || [];

  const uploadedFiles = await Promise.all(
    filesPaths.map((path) => uploadOnCloudinary(path))
  );

  const validFiles = uploadedFiles.filter(Boolean).map((file) => file.url);

  const post = await Post.create({
    content,
    media: validFiles,
    owner: req.user?._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, post, "post created Successfully!"));
});

const getUserPosts = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "provide a valid userId!");
  }

  const posts = await Post.find({
    owner: userId,
  }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, posts, "all posts fetched successfully!"));
});

const updatePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  if (!postId) {
    throw new ApiError(400, "provide a valid postId!");
  }

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedPost) {
    throw new ApiError(404, "Post not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPost, "post updated successfully!"));
});

const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    throw new ApiError(400, "provide a valid postId!");
  }

  const deletedPost = await Post.findByIdAndDelete(postId);

  if (!deletedPost) {
    throw new ApiError(404, "Post not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedPost, "post deleted successfully!"));
});

export { createPost, getUserPosts, updatePost, deletePost };
