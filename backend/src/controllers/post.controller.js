import mongoose from "mongoose";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import Like from "../models/like.model.js";

const createPost = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Provide some content!");
  }

  const filesPaths = req.files?.media?.map((file) => file.path) || [];

  const uploadedFiles = await Promise.all(
    filesPaths.map((path) => uploadOnCloudinary(path))
  );

  const validFiles = uploadedFiles
    .filter(Boolean)
    .map((file) => file.secure_url);

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

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Provide a valid userId!");
  }

  const posts = await Post.find({
    owner: userId,
  })
    .sort({ createdAt: -1 })
    .populate("owner", "username avatar fullname");

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

  await Comment.deleteMany({ post: postId });

  await Like.deleteMany({ post: postId });

  const deletedPost = await Post.findByIdAndDelete(postId);

  if (!deletedPost) {
    throw new ApiError(404, "Post not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedPost, "post deleted successfully!"));
});

const getAllPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  // Validate sortType
  if (sortType && !["asc", "desc"].includes(sortType.toLowerCase())) {
    throw new ApiError(400, "sortType must be either 'asc' or 'desc'");
  }

  // Allowed fields to sort by
  const allowedSortFields = ["createdAt", "likes", "comments"];
  if (sortBy && !allowedSortFields.includes(sortBy)) {
    throw new ApiError(400, "Invalid sortBy field");
  }

  // Validate userId
  if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  // Build filter
  let filter = {};
  if (query) {
    filter.$or = [{ content: { $regex: query, $options: "i" } }];
  }
  if (userId) {
    filter.owner = userId;
  }

  // Build sort object
  let sort = { createdAt: -1 }; // default: newest first
  if (sortBy) {
    sort = { [sortBy]: sortType === "asc" ? 1 : -1 };
  }

  // Fetch posts
  let posts = await Post.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNumber)
    .populate("owner", "username avatar")
    .lean();

  posts = await Promise.all(
    posts.map(async (post) => {
      const likeCount = await Like.countDocuments({ post: post._id });
      const isLiked = userId
        ? await Like.exists({
            post: post._id,
            likedBy: userId,
          })
        : false;

      return { ...post, likeCount, isLiked: Boolean(isLiked) };
    })
  );

  const totalPosts = await Post.countDocuments(filter);
  const totalPages = Math.ceil(totalPosts / limitNumber);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { posts, totalPosts, totalPages, page: pageNumber },
        "Posts fetched successfully!"
      )
    );
});

export { createPost, getUserPosts, updatePost, deletePost, getAllPosts };
