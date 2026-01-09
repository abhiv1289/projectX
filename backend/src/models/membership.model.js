import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["MEMBER", "OWNER"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "REMOVED"],
      default: "PENDING",
      required: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    joinedAt: {
      type: Date,
      default: null,
    },
    removedBy: {
      type: String,
      enum: ["USER", "OWNER"],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

membershipSchema.index({ userId: 1, communityId: 1 }, { unique: true });

export const Membership = mongoose.model("Membership", membershipSchema);
