import mongoose from "mongoose";
import Like from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Provide a valid videoId!");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found!");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  let isLiked;
  let message;

  if (!existingLike) {
    // create like
    await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });
    isLiked = true;
    message = "Liked";
  } else {
    // remove like
    await Like.deleteOne({
      video: videoId,
      likedBy: req.user?._id,
    });
    isLiked = false;
    message = "Unliked";
  }

  // compute current like count (source of truth)
  const likeCount = await Like.countDocuments({ video: videoId });

  // Return explicit boolean and count
  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked, likeCount }, message));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Provide a valid commentId!");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found!");
  }

  const alreadyLiked = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  let isLiked = false;

  if (!alreadyLiked) {
    await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });
    isLiked = true;
  } else {
    await Like.deleteOne({
      comment: commentId,
      likedBy: req.user?._id,
    });
    isLiked = false;
  }

  // get current like count
  const likeCount = await Like.countDocuments({ comment: commentId });

  const message = isLiked ? "Liked" : "Unliked";

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked, likeCount }, message));
});

const togglePostLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId) throw new ApiError(400, "Provide a valid postId!");

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found!");

  const existingLike = await Like.findOne({
    post: postId,
    likedBy: req.user?._id,
  });

  let isLiked;
  if (!existingLike) {
    await Like.create({ post: postId, likedBy: req.user?._id });
    isLiked = true;
  } else {
    await Like.deleteOne({ _id: existingLike._id });
    isLiked = false;
  }

  // ✅ count total likes after toggle
  const likeCount = await Like.countDocuments({ post: postId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLiked, likeCount },
        isLiked ? "Liked" : "Unliked"
      )
    );
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

const getVideoLikesCount = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({ message: "Video ID is required" });
    }

    // Count likes where the video field matches the given ID
    const likeCount = await Like.countDocuments({ video: videoId });

    return res.status(200).json({
      success: true,
      videoId,
      likeCount,
    });
  } catch (error) {
    console.error("Error fetching likes count:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while getting like count",
    });
  }
});

const getPostLikesCount = asyncHandler(async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    // Count likes where the video field matches the given ID
    const likeCount = await Like.countDocuments({ post: postId });

    return res.status(200).json({
      success: true,
      postId,
      likeCount,
    });
  } catch (error) {
    console.error("Error fetching likes count:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while getting like count",
    });
  }
});

const isVideoLiked = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!videoId || !userId) {
      return res
        .status(400)
        .json({ message: "Video ID and User ID are required" });
    }

    // Check if user has liked this video
    const isLiked = await Like.exists({ video: videoId, likedBy: userId });

    return res.status(200).json({
      success: true,
      videoId,
      userId,
      isLiked: !!isLiked, // returns true/false
    });
  } catch (error) {
    console.error("Error checking like status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while checking like status",
    });
  }
});

const isPostLiked = asyncHandler(async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id;

    if (!postId || !userId) {
      return res
        .status(400)
        .json({ message: "Video ID and User ID are required" });
    }

    // Check if user has liked this video
    const isLiked = await Like.exists({ post: postId, likedBy: userId });

    return res.status(200).json({
      success: true,
      postId,
      userId,
      isLiked: !!isLiked, // returns true/false
    });
  } catch (error) {
    console.error("Error checking like status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while checking like status",
    });
  }
});

export {
  toggleVideoLike,
  toggleCommentLike,
  togglePostLike,
  getLikedVideos,
  getLikedComments,
  getLikedPosts,
  getVideoLikesCount,
  isVideoLiked,
  getPostLikesCount,
  isPostLiked,
};
