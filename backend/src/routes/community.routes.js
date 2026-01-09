import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateCommunityPermission } from "../middlewares/community.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createCommunity,
  joinCommunity,
} from "../controllers/community.controller.js";

const router = Router();

/* Community Routes */
router.post(
  "/create",
  verifyJWT,
  upload.single("communityAvatar"),
  createCommunity
);

router.post("/join/:communityId", verifyJWT, joinCommunity);

export default router;
