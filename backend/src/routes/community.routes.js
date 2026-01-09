import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateCommunityPermission } from "../middlewares/community.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createCommunity,
  joinCommunity,
  approveMembershipRequest,
  rejectMembershipRequest,
  removeMember,
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

router.post(
  "/:communityId/approve-membership/:membershipId",
  verifyJWT,
  validateCommunityPermission("OWNER"),
  approveMembershipRequest
);

router.post(
  "/:communityId/reject-membership/:membershipId",
  verifyJWT,
  validateCommunityPermission("OWNER"),
  rejectMembershipRequest
);

router.post(
  "/:communityId/remove-member/:membershipId",
  verifyJWT,
  validateCommunityPermission("OWNER"),
  removeMember
);

export default router;
