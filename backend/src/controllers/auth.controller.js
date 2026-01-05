import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { OTP } from "../models/otp.model.js";
import { generateOTP, hashOTP, sendOTPEmail } from "../utils/otp.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
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

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password, avatar } = req.body;

  // ✅ Validate required fields (password might be optional for OAuth later)
  if ([fullname, username, email].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Fullname, username, and email are required");
  }

  // ✅ Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(400, "User with username or email already exists!");
  }

  // ✅ Handle avatar and cover image (file or URL)
  let avatarUrl = "";
  let coverImageUrl = "";

  // Handle avatar
  if (req.files?.avatar?.[0]?.buffer) {
    const uploadedAvatar = await uploadOnCloudinary(req.files.avatar[0].buffer);
    avatarUrl = uploadedAvatar?.secure_url;
  } else if (avatar && avatar.startsWith("https")) {
    avatarUrl = avatar;
  } else {
    throw new ApiError(400, "Avatar is required");
  }

  // Handle cover image (optional)
  if (req.files?.coverImage?.[0]?.buffer) {
    const uploadedCover = await uploadOnCloudinary(
      req.files.coverImage[0].buffer
    );
    coverImageUrl = uploadedCover?.secure_url || "";
  } else if (req.body.coverImage && req.body.coverImage.startsWith("https")) {
    coverImageUrl = req.body.coverImage;
  }

  // ✅ Create user
  const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    email,
    password: password || "OAuthUser@123", // fallback if OAuth login (so schema doesn’t fail)
    avatar: avatarUrl,
    coverImage: coverImageUrl,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully!"));
});

const auth0LoginUser = asyncHandler(async (req, res) => {
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

  const options = {
    httpOnly: true,
    secure: process.env.MODE === "production",
    sameSite: process.env.MODE === "production" ? "none" : "lax",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "Login successful"
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier) {
    throw new ApiError(400, "username or email is required!");
  }

  const user = await User.findOne({
    $or: [{ username: identifier }, { email: identifier }],
  });

  if (!user) {
    throw new ApiError(400, "user does not exists!");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid credentials");
  }

  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findOne(user._id).select(
    "-password -refreshToken"
  );

  if (!loggedInUser) {
    throw new ApiError(
      500,
      "Error in generating the access and refresh tokens."
    );
  }

  const options = {
    httpOnly: true,
    secure: process.env.MODE === "production",
    sameSite: process.env.MODE === "production" ? "none" : "lax",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User LoggedIn successfully!"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: process.env.MODE === "production",
    sameSite: process.env.MODE === "production" ? "none" : "lax",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully!"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(400, "unauthorized request");
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  if (!decodedToken) {
    throw new ApiError(400, "Invalid Refresh Token");
  }

  const user = await User.findById(decodedToken?._id);

  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or used");
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshToken(user._id);

  const options = {
    httpOnly: true,
    secure: process.env.MODE === "production",
    sameSite: process.env.MODE === "production" ? "none" : "lax",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken: newRefreshToken,
        },
        "Access Token refreshed successfully!"
      )
    );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
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

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "current User"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
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

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarFile = req.file?.avatar?.[0]?.buffer;

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

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageFile = req.file?.coverImage?.[0]?.buffer;

  if (!coverImageFile) {
    throw new ApiError(400, "CoverImage is missing!");
  }

  const CoverImage = await uploadOnCloudinary(CoverImageLocalPath);

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

const getUserChannelProfile = asyncHandler(async (req, res) => {
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

const getWatchHistory = asyncHandler(async (req, res) => {
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

const addToWatchHistory = asyncHandler(async (req, res) => {
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

// Send OTP
const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = generateOTP();
  const otpHash = hashOTP(otp);

  await OTP.create({ email, otpHash });
  await sendOTPEmail(email, otp);

  res.json({ message: "OTP sent successfully" });
};

// Verify OTP
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP required" });

  const otpRecord = await OTP.findOne({ email });
  if (!otpRecord)
    return res.status(400).json({ message: "OTP expired or invalid" });

  if (hashOTP(otp) !== otpRecord.otpHash)
    return res.status(400).json({ message: "Invalid OTP" });

  await OTP.deleteOne({ _id: otpRecord._id });

  res.json({ message: "OTP verified successfully" });
};

export {
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
};
