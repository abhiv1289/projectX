import express, { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  getVideoComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { toggleCommentLike } from "../controllers/like.controller.js";

const router = Router();

router.route("/:videoId").get(getVideoComments);

router.use(verifyJWT);

router.route("/add/:videoId").post(addComment);

router.route("/update/:commentId").patch(updateComment);

router.route("/delete/:commentId").delete(deleteComment);

router.route("/toggle-like/:commentId").post(toggleCommentLike);

export default router;
