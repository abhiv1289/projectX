import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

export const verifyJWT = async (req, res, next) => {
  try {
    // 1️⃣ Get token from cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Unauthorized request. Token missing.",
        });
    }

    // 2️⃣ Verify token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      console.error("JWT verification error:", err.message);
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired access token." });
    }

    // 3️⃣ Check if decoded token has user ID
    if (!decodedToken?._id) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid access token." });
    }

    // 4️⃣ Fetch user from DB
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found for this token." });
    }

    // 5️⃣ Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("verifyJWT middleware error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Server error during token verification.",
      });
  }
};
