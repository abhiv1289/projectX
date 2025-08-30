import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/:channelId").get(getChannelStats);

router.route("/c/:channelId").get(getChannelVideos);

export default router;
