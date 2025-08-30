import express, { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getVideoComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { toggleCommentLike } from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/:commentId").patch(updateComment);

router.route("/:commentId").delete(deleteComment);

router.route("/toggle-like/:commentId").post(toggleCommentLike);

export default router;
