// models/Food.js

import { Schema, model } from "mongoose";

const foodSchema = new Schema(
  {
    foodName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    expiryTime: {
      type: Date,
      required: true,
    },

    pickupWindowStart: {
      type: Date,
      required: true,
    },

    pickupWindowEnd: {
      type: Date,
      required: true,
    },

    imageUrl: {
      type: String, // store cloud URL (Cloudinary / S3)
    },

    status: {
      type: String,
      enum: ["available", "requested", "approved", "collected", "expired"],
      default: "available",
    },

    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

foodSchema.index({ expiryTime: 1 });
foodSchema.index({ status: 1 });

// Prevent invalid pickup window
foodSchema.pre("save", function (next) {
  if (this.pickupWindowEnd <= this.pickupWindowStart) {
    return next(new Error("Pickup end time must be after start time"));
  }

  if (this.expiryTime <= new Date()) {
    return next(new Error("Expiry time must be in the future"));
  }

  next();
});

export default model("Food", foodSchema);
