import express, { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllPosts,
  createPost,
  deletePost,
  getUserPosts,
  updatePost,
} from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  addComment,
  getPostComments,
} from "../controllers/comment.controller.js";
import { togglePostLike } from "../controllers/like.controller.js";

const router = Router();

router.route("/search").get(getAllPosts);
router.route("/u/:userId").get(getUserPosts);

router.use(verifyJWT);

router.route("/create-post").post(
  upload.fields([
    {
      name: "media",
      maxCount: 5,
    },
  ]),
  createPost
);

router.route("/update-post/:postId").patch(updatePost);

router.route("/:postId").delete(deletePost);

router.route("/comment/add/:postId").post(addComment);

router.route("/comment/:postId").get(getPostComments);

router.route("/toggle-like/:postId").post(togglePostLike);

export default router;
