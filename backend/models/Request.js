// models/Request.js

import { Schema, model } from "mongoose";

const requestSchema = new Schema(
  {
    food: {
      type: Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },

    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    foodBank: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "collected"],
      default: "pending",
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    approvedAt: {
      type: Date,
    },

    collectedAt: {
      type: Date,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

// Prevent duplicate active requests
requestSchema.index({ food: 1, foodBank: 1 }, { unique: true });

export default model("Request", requestSchema);
