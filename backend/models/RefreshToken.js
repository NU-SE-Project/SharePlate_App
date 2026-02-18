import { Schema, model } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Store ONLY a hash of the refresh token (never store plain token)
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
      index: true,
    },

    // If you want explicit revoke instead of delete
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Auto-cleanup expired documents (Mongo TTL index)
// Mongo will delete after expiresAt time passes.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model("RefreshToken", refreshTokenSchema);
