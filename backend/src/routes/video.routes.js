import express, { Router } from "express";
import {
  publishAVideo,
  deleteVideo,
  updateVideo,
  togglePublishStatus,
  getVideoById,
  getAllVideos,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  getVideoComments,
} from "../controllers/comment.controller.js";
import { toggleVideoLike } from "../controllers/like.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/publish-video").post(
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

router.route("/delete-video/:videoId").delete(deleteVideo);

router
  .route("/update-video/:videoId")
  .patch(upload.single("thumbnail"), updateVideo);

router.route("/publish-status/:videoId").patch(togglePublishStatus);

router.route("/c/:videoId").get(getVideoById);

router.route("/search").get(getAllVideos);

router.route("/comment/:videoId").post(addComment);

router.route("/:videoId").get(getVideoComments);

router.route("/toggle-like/:videoId").post(toggleVideoLike);

export default router;
