import mongoose from "mongoose";
import Like from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Post from "../models/post.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "provide a valid videoId!");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found!");
  }

  const AlreadyLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  let liked = null;
  let message = "";

  if (!AlreadyLiked) {
    liked = await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });
    message = "liked";
  } else {
    liked = await Like.deleteOne({
      video: videoId,
      likedBy: req.user?._id,
    });
    message = "Unliked";
  }

  return res.status(200).json(new ApiResponse(200, liked, message));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "provide a valid commentId!");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found!");
  }

  const AlreadyLiked = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  let liked = null;
  let message = "";

  if (!AlreadyLiked) {
    liked = await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });
    message = "liked";
  } else {
    liked = await Like.deleteOne({
      comment: commentId,
      likedBy: req.user?._id,
    });
    message = "Unliked";
  }

  return res.status(200).json(new ApiResponse(200, liked, message));
});

const togglePostLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    throw new ApiError(400, "provide a valid postId!");
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found!");
  }

  const AlreadyLiked = await Like.findOne({
    post: postId,
    likedBy: req.user?._id,
  });

  let liked = null;
  let message = "";

  if (!AlreadyLiked) {
    liked = await Like.create({
      post: postId,
      likedBy: req.user?._id,
    });
    message = "liked";
  } else {
    liked = await Like.deleteOne({
      post: postId,
      likedBy: req.user?._id,
    });
    message = "Unliked";
  }

  return res.status(200).json(new ApiResponse(200, liked, message));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const videos = await Like.find({
    likedBy: req.user?._id,
    video: { $ne: null },
  }).populate("video", "title thumbnail duration");

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "liked videos fetched successfully!"));
});

const getLikedPosts = asyncHandler(async (req, res) => {
  const posts = await Like.find({
    likedBy: req.user?._id,
    post: { $ne: null },
  }).populate("post", "content media");

  return res
    .status(200)
    .json(new ApiResponse(200, posts, "liked posts fetched successfully!"));
});

const getLikedComments = asyncHandler(async (req, res) => {
  const comments = await Like.find({
    likedBy: req.user?._id,
    comment: { $ne: null },
  }).populate("comment", "content");

  return res
    .status(200)
    .json(
      new ApiResponse(200, comments, "liked comment fetched successfully!")
    );
});

export {
  toggleVideoLike,
  toggleCommentLike,
  togglePostLike,
  getLikedVideos,
  getLikedComments,
  getLikedPosts,
};
