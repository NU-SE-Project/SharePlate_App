import { Schema, model } from "mongoose";

const foodRequestSchema = new Schema({
  foodbank_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  foodName: {
    type: String,
    required: true,
    trim: true,
  },

  foodType: {
    type: String,
    enum: ["veg", "non-veg"],
    required: true,
  },

  requestedQuantity: {
    type: Number,
    required: true,
    min: 1,
  },

  remainingQuantity: {
    type: Number,
    required: true,
    min: 0,
  },

  status: {
    type: String,
    enum: ["open", "fulfilled", "closed"],
    default: "open",
  },
}, { timestamps: true });

export default model("FoodRequest", foodRequestSchema);