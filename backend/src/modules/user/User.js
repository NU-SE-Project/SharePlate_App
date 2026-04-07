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

    // Store HASHED password only
    password: { type: String, required: true, select: false },

    googleId: {
      type: String,
      default: null,
      index: true,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    address: { type: String, required: true, trim: true },

    contactNumber: { type: String, required: true, trim: true },

    role: {
      type: String,
      enum: ["restaurant", "foodbank", "admin"],
      required: true,
    },

    // Geolocation (GeoJSON)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function (arr) {
            return Array.isArray(arr) && arr.length === 2;
          },
          message: "Location coordinates must be [longitude, latitude]",
        },
      },
    },

    // Optional org verification (for restaurants / shelters)
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
      index: true,
    },
    verifiedAt: { type: Date, default: null },

    // Admin can disable accounts
    isActive: { type: Boolean, default: true },
    authVersion: { type: Number, default: 0, min: 0 },

    // Email verification
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false, default: null },
    emailVerificationExpires: { type: Date, select: false, default: null },

    // Password reset
    passwordResetToken: { type: String, select: false, default: null },
    passwordResetExpires: { type: Date, select: false, default: null },

    // Login security
    failedLoginAttempts: { type: Number, default: 0, min: 0 },
    accountLockedUntil: { type: Date, default: null },

    // Audit fields
    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, default: null },
  },
  { timestamps: true },
);

userSchema.index({ location: "2dsphere" });

// Unique index already defined via the email field's `unique: true`.
// If you need case-insensitive uniqueness, add a collation at the collection level.

// userSchema.index({ isActive: 1, role: 1, verificationStatus: 1, createdAt: -1 });

// userSchema.index({ emailVerificationToken: 1 }, { sparse: true });
// userSchema.index({ passwordResetToken: 1 }, { sparse: true });

// userSchema.index({ accountLockedUntil: 1 });

export default model("User", userSchema);
