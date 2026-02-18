import { Schema, model } from "mongoose";

const requestSchema = new Schema(
  {
    food_id: {
      type: Schema.Types.ObjectId,
      ref: "Donation",
      required: true,
    },

    restaurant_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    foodBank_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    requestedQuantity: {
      type: Number,
      required: true,
      min: 1,
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

    approvedAt: Date,
    rejectedAt: Date,
    collectedAt: Date,

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default model("Request", requestSchema);
