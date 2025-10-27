import express, { Router } from "express";
import {
  publishAVideo,
  deleteVideo,
  updateVideo,
  togglePublishStatus,
  getVideoById,
  getAllVideos,
  getTrendingVideos,
  getWatchLaterVideos,
  addToWatchLater,
  removeFromWatchLater,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  getVideoComments,
} from "../controllers/comment.controller.js";
import { toggleVideoLike } from "../controllers/like.controller.js";

const router = Router();

router.route("/publish-video").post(
  verifyJWT,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishAVideo
);

router.route("/delete-video/:videoId").delete(verifyJWT, deleteVideo);

router
  .route("/update-video/:videoId")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

router.route("/publish-status/:videoId").patch(verifyJWT, togglePublishStatus);

router.route("/c/:videoId").get(getVideoById);

router.route("/search").get(getAllVideos);

router.route("/comment/:videoId").post(verifyJWT, addComment);

router.route("/list").get(verifyJWT, getWatchLaterVideos);
router.route("/trending").get(getTrendingVideos);
router.route("/:videoId").get(getVideoComments);

router.route("/toggle-like/:videoId").post(verifyJWT, toggleVideoLike);

router.route("/add").post(verifyJWT, addToWatchLater);

router.route("/remove").post(verifyJWT, removeFromWatchLater);

export default router;
