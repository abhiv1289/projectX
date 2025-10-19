import mongoose from "mongoose";
import Comment from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Like from "../models/like.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { userId } = req.query;
  let { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new ApiError(400, "provide valid videoId");
  }

  page = parseInt(page);
  limit = parseInt(limit);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;

  const skip = (page - 1) * limit;

  let comments = await Comment.find({ video: videoId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("owner", "username avatar")
    .lean();

  comments = await Promise.all(
    comments.map(async (comment) => {
      const likeCount = await Like.countDocuments({ comment: comment._id });
      const isLiked = userId
        ? await Like.exists({ comment: comment._id, likedBy: userId })
        : false;

      return { ...comment, likeCount, isLiked: Boolean(isLiked) };
    })
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { comments, page, limit },
        "comments fetched successfully!"
      )
    );
});

const getPostComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    throw new ApiError(400, "provide valid postId");
  }

  const comments = await Comment.find({
    post: postId,
  }).populate("owner", "username avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "comments fetched successfully!"));
});

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { postId, videoId } = req.params;

  if (!content) {
    throw new ApiError(400, "provide the content!");
  }

  if (postId && videoId) {
    throw new ApiError(
      400,
      "Comment can be on either a post OR a video, not both!"
    );
  }

  const comment = await Comment.create({
    content,
    owner: req.user?._id,
    post: postId || null,
    video: videoId || null,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added successfully!"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!commentId) {
    throw new ApiError(400, "provide a valid commentId");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedComment) {
    throw new ApiError(404, "comment not found!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedComment, "comment updated successfully!")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "provide a valid commentId");
  }

  const deletedComment = await Comment.findByIdAndDelete(commentId);

  if (!deletedComment) {
    throw new ApiError(404, "comment not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedComment, "comment delete successfully!"));
});

export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
  getPostComments,
};
