import Community from "../models/community.model.js";
import Membership from "../models/membership.model.js";
export const validateCommunityPermision = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      //verifyJWT must run before this middleware
      const authenticatedUser = req.user;
      const communityId = req.params.communityId || req.body.communityId;

      if (!authenticatedUser || !communityId) {
        return res.status(401).json({
          success: false,
          message: "Missing authenticated user or communityId.",
        });
      }

      //check if community exists
      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({
          success: false,
          message: "Community not found.",
        });
      }

      //check if user is member of the community
      const membership = await Membership.findOne({
        userId: authenticatedUser._id,
        communityId: communityId,
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: "You are not a member of this community.",
        });
      }

      //check membership status
      if (membership.status !== "APPROVED") {
        return res.status(403).json({
          success: false,
          message:
            membership.status === "PENDING"
              ? "Your request to join this community is pending approval."
              : "You no longer have access to this community.",
        });
      }

      //Role-based access control
      if (requiredRole && membership.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have the required permissions to perform this action.",
        });
      }

      //Attack validated data to request
      req.community = community;
      req.membership = membership;

      next();
    } catch (error) {
      console.error("Community permission error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error while validating community access.",
      });
    }
  };
};
