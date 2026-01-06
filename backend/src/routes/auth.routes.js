import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  auth0LoginUser,
  sendOtp,
  verifyOtp,
  addToWatchHistory,
} from "../controllers/auth.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/* Auth */
router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.post("/login", loginUser);
router.post("/auth0-login", auth0LoginUser);
router.post("/logout", verifyJWT, logoutUser);
router.post("/refresh-token", refreshAccessToken);

/* Profile */
router.get("/me", verifyJWT, getCurrentUser);
router.patch("/update-details", verifyJWT, updateAccountDetails);
router.patch(
  "/update-avatar",
  verifyJWT,
  upload.single("avatar"),
  updateAvatar
);
router.patch(
  "/update-cover-image",
  verifyJWT,
  upload.single("coverImage"),
  updateCoverImage
);

/* User data */
router.get("/c/:username", verifyJWT, getUserChannelProfile);
router.get("/history", verifyJWT, getWatchHistory);
router.post("/add-to-history", verifyJWT, addToWatchHistory);
router.get("/get-user", verifyJWT, getCurrentUser);

/* OTP */
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

export default router;
