// models/User.js

import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // do not return password in queries
    },

    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    contactNumber: {
      type: String,
      required: true,
      match: [/^[0-9]{10,15}$/, "Invalid contact number"],
    },

    role: {
      type: String,
      enum: ["restaurant", "foodbank", "admin"],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default model("User", userSchema);
