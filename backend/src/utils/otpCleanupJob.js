import cron from "node-cron";
import Pickup from "../modules/pickup/Pickup.js";

export function startOtpCleanupJob() {
  // ⏰ Runs once every day at 00:05 (midnight)
  cron.schedule("5 0 * * *", async () => {
    try {
      console.log("🧹 Running daily OTP cleanup job...");

      const now = new Date();

      const result = await Pickup.updateMany(
        {
          otpExpiresAt: { $lt: now },
          verified: false,
          otpHash: { $ne: null },
        },
        {
          $set: {
            otpHash: null,
            // otpExpiresAt: null,
            // otpAttempts: 0,
            // otpLockedUntil: null
          },
        },
      );

      console.log(`✅ Expired OTPs cleared: ${result.modifiedCount}`);
    } catch (error) {
      console.error("❌ OTP Cleanup Job Error:", error.message);
    }
  });
}
