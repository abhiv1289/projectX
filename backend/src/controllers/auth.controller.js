import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import { OTP } from "../models/otp.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { generateOTP, hashOTP, sendOTPEmail } from "../utils/otp.js";
import { isProduction } from "../config/env.js";

export const cookieOptions = {
  httpOnly: true,
  secure: isProduction, // true on Vercel, false on localhost
  sameSite: isProduction ? "none" : "lax",
};

const generateTokens = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();

    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Error in generating the access and refresh tokens."
    );
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password, avatar } = req.body;

  if (!fullname || !username || !email) {
    throw new ApiError(400, "Fullname, username and email are required");
  }

  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) throw new ApiError(400, "User already exists");

  let avatarUrl = avatar;
  if (req.files?.avatar?.[0]?.buffer) {
    const uploaded = await uploadOnCloudinary(req.files.avatar[0].buffer);
    avatarUrl = uploaded.secure_url;
  }

  if (!avatarUrl) throw new ApiError(400, "Avatar is required");

  const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    email,
    password: password || "OAuthUser@123",
    avatar: avatarUrl,
  });

  const safeUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res
    .status(201)
    .json(new ApiResponse(201, safeUser, "User registered successfully"));
});

export const auth0LoginUser = asyncHandler(async (req, res) => {
  const { user } = req.body;

  if (!user || !user.email) {
    throw new ApiError(400, "Invalid Auth0 user data");
  }

  // Try to find existing user
  let existingUser = await User.findOne({ email: user.email });

  // If user doesn't exist, register automatically
  if (!existingUser) {
    const newUser = await User.create({
      fullname: user.name || "User",
      username: user.nickname || user.email.split("@")[0],
      email: user.email,
      password: "OAuthUser@123", // dummy password
      avatar: user.picture,
      coverImage: "",
    });

    existingUser = newUser;
  }

  // Generate tokens
  const accessToken = await existingUser.generateAccessToken();
  const refreshToken = await existingUser.generateRefreshToken();

  existingUser.refreshToken = refreshToken;
  await existingUser.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(existingUser._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "Login successful"
      )
    );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateTokens(user);

  const safeUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { user: safeUser }, "Login successful"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

  res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new ApiError(401, "Unauthorized");

  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(decoded._id);

  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const { accessToken, refreshToken } = await generateTokens(user);

  res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { accessToken }, "Token refreshed"));
});

export const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(400, "Error changing password");
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Incorrect Password");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "current User"));
});

export const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname } = req.body;

  if (!fullname) {
    throw new ApiError(400, "All details are required!");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname: fullname,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Details updated successfully!"));
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const avatarFile = req.file?.buffer;

  if (!avatarFile) {
    throw new ApiError(400, "Avatar is missing!");
  }

  const avatar = await uploadOnCloudinary(avatarFile);
  if (!avatar.secure_url) {
    throw new ApiError(400, "Error uploading avatar on cloudinary");
  }

  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      avatar: avatar.secure_url,
    },
  }).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully!"));
});

export const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageFile = req.file?.buffer;

  if (!coverImageFile) {
    throw new ApiError(400, "CoverImage is missing!");
  }

  const CoverImage = await uploadOnCloudinary(coverImageFile);

  if (!CoverImage.secure_url) {
    throw new ApiError(400, "Error uploading CoverImage on cloudinary");
  }

  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      coverImage: CoverImage.secure_url,
    },
  }).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "CoverImage updated successfully!"));
});

export const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing!");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exists!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "Channel details fetched successfully!")
    );
});

export const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "watch history fetched successfully!"
      )
    );
});

export const addToWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id; // logged-in user
  const videoId = req.body.videoId; // video being watched

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  // Use $addToSet to avoid duplicates
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $pull: { watchHistory: videoId } }, // remove if already exists
    { new: true }
  );

  // Then push to the start (most recent first)
  await User.findByIdAndUpdate(userId, {
    $push: { watchHistory: { $each: [videoId], $position: 0, $slice: 50 } },
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Video added to watch history"));
});

export const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email required");

  const otp = generateOTP();
  const otpHash = hashOTP(otp);

  await OTP.findOneAndUpdate(
    { email },
    { otpHash, createdAt: Date.now() },
    { upsert: true }
  );

  await sendOTPEmail(email, otp);

  res.json(new ApiResponse(200, {}, "OTP sent"));
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const record = await OTP.findOne({ email });
  if (!record || record.otpHash !== hashOTP(otp)) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  await OTP.deleteOne({ email });

  res.json(new ApiResponse(200, {}, "OTP verified"));
});
