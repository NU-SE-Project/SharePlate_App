import mongoose from "mongoose";

const pickupSchema = new mongoose.Schema(
  {
    request_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request", 
      required: true,
    },

    restaurant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    foodbank_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // OTP Fields
    otpHash: {
      type: String,
      required: true,
    },

    otpExpiresAt: {
      type: Date,
      required: true,
    },

    otpAttempts: {
      type: Number,
      default: 0,
    },

    otpLockedUntil: {
      type: Date,
      default: null,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    verifiedAt: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["generated", "verified"],
      default: "generated",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Pickup", pickupSchema);