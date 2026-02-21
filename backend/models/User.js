import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    // Display name of the user/organization contact
    name: { type: String, required: true, trim: true },

    // Unique email for register/login
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Store HASHED password only (never store plain passwords)
    // select:false ensures when you do User.find(), password won't be returned
    password: { type: String, required: true, select: false },

    address: { type: String, required: true, trim: true },

    contactNumber: { type: String, required: true, trim: true },

    // Role-based access control
    role: {
      type: String,
      enum: ["restaurant", "foodbank", "admin"],
      required: true,
    },

    // Geolocation for future filtering (within 50km etc.)
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

    // Admin can disable accounts without deleting
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// This enables geo queries like $near, $geoWithin in MongoDB
userSchema.index({ location: "2dsphere" });

export default model("User", userSchema);
