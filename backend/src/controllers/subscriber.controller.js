import mongoose from "mongoose";
import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Provide a valid channelId");
  }

  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user?._id,
  });

  let message;
  let subscription = null;

  if (!existingSubscription) {
    subscription = await Subscription.create({
      channel: channelId,
      subscriber: req.user?._id,
    });
    message = "Subscribed Successfully!";
  } else {
    await Subscription.deleteOne({
      channel: channelId,
      subscriber: req.user?._id,
    });
    message = "Unsubscribed Successfully!";
  }

  return res.status(200).json(new ApiResponse(200, { subscription }, message));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Provide a valid channelId");
  }

  const subscribersList = await Subscription.find({
    channel: channelId,
  }).populate("subscriber", "username email avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribersList,
        "subscribers details fetched successfully!"
      )
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId) {
    throw new ApiError(400, "provide a valid subscriberId");
  }

  const subscribedChannels = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel", "username avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribedChannels, "channels fetched successfully!")
    );
});

const isSubscribed = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Provide a valid channelId");
  }

  // Check if a subscription exists for the logged-in user and the channel
  const subscription = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user?._id,
  });

  const subscribed = !!subscription; // true if subscription exists, false otherwise

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribed },
        "Subscription status fetched successfully!"
      )
    );
});

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
  isSubscribed,
};
