import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";
import Like from "../models/like.model.js";
import Subscription from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid ChannelId!");
  }

  const [
    totalSubscribers,
    totalVideos,
    totalVideoViewsAgg,
    totalLikesAgg,
    totalCommentsAgg,
    topVideos,
    latestVideos,
  ] = await Promise.all([
    Subscription.countDocuments({ channel: channelId }),

    Video.countDocuments({ owner: channelId }),

    Video.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]),

    Like.aggregate([
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "videoData",
        },
      },
      {
        $unwind: "$videoData",
      },
      {
        $match: {
          "videoData.owner": new mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $count: "totalLikes",
      },
    ]),

    Comment.aggregate([
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "videoData",
        },
      },
      {
        $unwind: "$videoData",
      },
      {
        $match: {
          "videoData.owner": new mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $count: "totalComments",
      },
    ]),

    Video.find({ owner: channelId })
      .sort({ views: -1 })
      .limit(5)
      .select("title thumbnail views likes createdAt"),

    Video.find({ owner: channelId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title thumbnail views likes createdAt"),
  ]);

  const totalVideoViews =
    totalVideoViewsAgg.length > 0 ? totalVideoViewsAgg[0].totalViews : 0;

  const totalLikes = totalLikesAgg.length > 0 ? totalLikesAgg[0].totalLikes : 0;

  const totalComments =
    totalCommentsAgg.length > 0 ? totalCommentsAgg[0].totalComments : 0;

  const averageViewsPerVideo =
    totalVideos > 0 ? totalVideoViews / totalVideos : 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalSubscribers,
        totalVideos,
        totalVideoViews,
        totalLikes,
        totalComments,
        averageViewsPerVideo,
        topVideos,
        latestVideos,
      },
      "Channel stats fetched successfully"
    )
  );
});
const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  let { page = 1, limit = 10 } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;

  const skip = (page - 1) * limit;

  if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Provide a valid channelId!");
  }

  const Videos = await Video.find({ owner: channelId })
    .populate("owner", "username avatar")
    .select("title thumbnail views duration createdAt isPublished")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { Videos, page, limit },
        "videos fetched successfully!"
      )
    );
});

export { getChannelStats, getChannelVideos };
