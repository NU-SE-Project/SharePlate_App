import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    address: { type: String, required: true, trim: true },

    contactNumber: { type: String, required: true, trim: true },

    role: {
      type: String,
      enum: ["restaurant", "foodbank", "admin"],
      required: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.index({ location: "2dsphere" });

export default model("User", userSchema);
