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

export const approveMembershipRequest = asyncHandler(async (req, res) => {
  const { membershipId } = req.params;
  const ownerMembership = req.membership;
  const membership = await Membership.findById(membershipId);
  if (!membership) {
    throw new ApiError(404, "Membership request not found");
  }

  if (
    membership.communityId.toString() !== ownerMembership.communityId.toString()
  ) {
    throw new ApiError(
      403,
      "You are not authorized to approve this membership request"
    );
  }

  if (membership.status !== "PENDING") {
    throw new ApiError(400, "Membership request is not pending");
  }

  if (membership.userId.toString() === ownerMembership.userId.toString()) {
    throw new ApiError(400, "Owner cannot approve their own membership");
  }

  membership.status = "APPROVED";
  membership.joinedAt = new Date();
  await membership.save();
  return res
    .status(200)
    .json(
      new ApiResponse(
        true,
        "Membership request approved successfully",
        membership
      )
    );
});

export const rejectMembershipRequest = asyncHandler(async (req, res) => {
  const { membershipId } = req.params;
  const ownerMembership = req.membership;
  const membership = await Membership.findById(membershipId);
  if (!membership) {
    throw new ApiError(404, "Membership request not found");
  }

  if (
    membership.communityId.toString() !== ownerMembership.communityId.toString()
  ) {
    throw new ApiError(
      403,
      "You are not authorized to reject this membership request"
    );
  }

  if (membership.status !== "PENDING") {
    throw new ApiError(400, "Membership request is not pending");
  }

  if (membership.userId.toString() === ownerMembership.userId.toString()) {
    throw new ApiError(400, "Owner cannot reject their own membership");
  }

  membership.status = "REJECTED";
  membership.joinedAt = null;
  await membership.save();
  return res
    .status(200)
    .json(
      new ApiResponse(
        true,
        "Membership request rejected successfully",
        membership
      )
    );
});

export const removeMember = asyncHandler(async (req, res) => {
  const { membershipId } = req.params;
  const ownerMembership = req.membership;
  const membership = await Membership.findById(membershipId);
  if (!membership) {
    throw new ApiError(404, "Membership not found");
  }

  if (
    membership.communityId.toString() !== ownerMembership.communityId.toString()
  ) {
    throw new ApiError(403, "You are not authorized to remove this member");
  }

  if (membership.status !== "APPROVED") {
    throw new ApiError(400, "Only approved members can be removed");
  }

  if (membership.userId.toString() === ownerMembership.userId.toString()) {
    throw new ApiError(400, "Owner cannot remove themselves");
  }

  membership.status = "REMOVED";
  membership.joinedAt = null;
  membership.removedBy = "OWNER";
  await membership.save();
  return res
    .status(200)
    .json(new ApiResponse(true, "Member removed successfully", membership));
});

export const leaveCommunity = asyncHandler(async (req, res) => {
  const authenticatedUser = req.user;
  const { communityId } = req.params;
  const membership = await Membership.findOne({
    userId: authenticatedUser._id,
    communityId: communityId,
  });
  if (!membership) {
    throw new ApiError(404, "Membership not found");
  }
  if (membership.status !== "APPROVED") {
    throw new ApiError(400, "You are not an approved member of this community");
  }
  if (membership.role === "OWNER") {
    throw new ApiError(400, "Owner cannot leave the community");
  }
  membership.status = "REMOVED";
  membership.removedBy = "USER";
  membership.joinedAt = null;
  await membership.save();

  return res
    .status(200)
    .json(new ApiResponse(true, "Left community successfully", membership));
});

export const listCommunityMembers = asyncHandler(async (req, res) => {
  const { communityId } = req.params;

  const members = await Membership.find({
    communityId,
    status: "APPROVED",
  })
    .populate("userId", "fullname username email avatar")
    .sort({ joinedAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(true, "Community members fetched successfully", members)
    );
});

export const listPendingRequests = asyncHandler(async (req, res) => {
  const { communityId } = req.params;

  const members = await Membership.find({
    communityId,
    status: "PENDING",
  })
    .populate("userId", "fullname username email avatar")
    .sort({ joinedAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        true,
        "Pending membership requests fetched successfully",
        members
      )
    );
});
