import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getLikedComments,
  getLikedPosts,
  getLikedVideos,
} from "../controllers/like.controller.js";

const router = Router();

router.route("/videos").get(verifyJWT, getLikedVideos);

router.route("/posts").get(verifyJWT, getLikedPosts);

router.route("/comments").get(verifyJWT, getLikedComments);

export default router;
