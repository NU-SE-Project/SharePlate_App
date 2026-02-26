import { Schema, model } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Store ONLY a hash of the refresh token
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    // Optional metadata (matches your authService)
    createdByIp: { type: String, default: null },
    userAgent: { type: String, default: null },

    // Optional revoke tracking (if you decide to revoke instead of delete)
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// TTL index to auto-delete expired refresh sessions
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model("RefreshToken", refreshTokenSchema);
