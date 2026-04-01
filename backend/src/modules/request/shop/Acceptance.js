import { Schema, model } from "mongoose";

const acceptanceSchema = new Schema({
  request_id: {
    type: Schema.Types.ObjectId,
    ref: "FoodRequest",
    required: true,
  },

  restaurant_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true, 
  },

  acceptedQuantity: {
    type: Number,
    required: true,
    min: 1,
  },

  pickup_id: {
    type: Schema.Types.ObjectId,
    ref: "Pickup",
  },

  status: {
    type: String,
    enum: ["pending", "delivered", "expired"],
    default: "pending",
  },
}, { timestamps: true });

// prevent same restaurant from accepting same request twice
acceptanceSchema.index({ request_id: 1, restaurant_id: 1 }, { unique: true });

export default model("Acceptance", acceptanceSchema);