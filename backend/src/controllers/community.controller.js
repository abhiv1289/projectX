import { verifyJWT } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Community } from "../models/community.model.js";
import { Membership } from "../models/membership.model.js";

export const createCommunity = asyncHandler(async (req, res) => {
  // Only authenticated users can create communities
  const communityOwner = req.user;
  const { name, description, type, visibility } = req.body;

  if (
    !name?.trim() ||
    !description?.trim() ||
    !type?.trim() ||
    !visibility?.trim()
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (!req.file?.buffer) {
    throw new ApiError(400, "Community avatar is required");
  }

  const normalizedName = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  //check if the normalizedName already exists
  const existingCommunity = await Community.findOne({ normalizedName });
  if (existingCommunity) {
    throw new ApiError(409, "Community name already exists");
  }

  //upload community avatar to cloudinary
  const communityAvatar = await uploadOnCloudinary(req.file?.buffer);

  //create new community
  const community = await Community.create({
    name,
    normalizedName,
    description,
    type,
    visibility,
    ownerId: communityOwner._id,
    communityAvatar: communityAvatar.secure_url,
  });

  //create membership for the owner
  await Membership.create({
    userId: communityOwner._id,
    communityId: community._id,
    role: "OWNER",
    status: "APPROVED",
    joinedAt: new Date(),
  });

  return res
    .status(201)
    .json(new ApiResponse(true, "Community created successfully", community));
});

export const joinCommunity = asyncHandler(async (req, res) => {
  const authenticatedUser = req.user;
  const { communityId } = req.params;
  const community = await Community.findById(communityId);
  if (!community) {
    throw new ApiError(404, "Community not found");
  }
  //check if user is already a member
  const existingMembership = await Membership.findOne({
    userId: authenticatedUser._id,
    communityId: communityId,
  });
  if (existingMembership) {
    if (existingMembership.status === "PENDING") {
      throw new ApiError(
        409,
        "Your request to join this community is already pending approval"
      );
    }

    if (existingMembership.status === "APPROVED") {
      throw new ApiError(409, "You are already a member of this community");
    }

    throw new ApiError(403, "You are not allowed to join this community again");
  }
  //create membership with PENDING status
  const membership = await Membership.create({
    userId: authenticatedUser._id,
    communityId: communityId,
    role: "MEMBER",
    status: "PENDING",
  });
  return res
    .status(201)
    .json(
      new ApiResponse(
        true,
        "Your request to join the community has been sent for approval",
        membership
      )
    );
});
