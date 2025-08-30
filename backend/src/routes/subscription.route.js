import express, { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscriber.controller.js";

const router = Router();

router
  .route("/toggle-subscription/:channelId")
  .post(verifyJWT, toggleSubscription);

router.route("/c/:channelId").get(verifyJWT, getUserChannelSubscribers);

router.route("/u/:subscriberId").get(verifyJWT, getSubscribedChannels);

export default router;
