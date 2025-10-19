import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getLikedComments,
  getLikedPosts,
  getLikedVideos,
  getVideoLikesCount,
  isVideoLiked,
  getPostLikesCount,
  isPostLiked,
} from "../controllers/like.controller.js";

const router = Router();

router.route("/videos").get(verifyJWT, getLikedVideos);

router.route("/posts").get(verifyJWT, getLikedPosts);

router.route("/comments").get(verifyJWT, getLikedComments);

router.route("/get-video-like/:videoId").get(getVideoLikesCount);

router.route("/get-post-like/:postId").get(getPostLikesCount);

router.route("/video/:videoId").get(verifyJWT, isVideoLiked);

router.route("/post/:postId").get(verifyJWT, isPostLiked);

export default router;
