import cron from "node-cron";
import Donation from "../modules/donation/shop/Donation.js";

export function startDonationCleanupJob() {
  // ⏰ Runs every minute to check for expired donations
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const result = await Donation.updateMany(
        {
          expiryTime: { $lt: now },
          status: "available",
        },
        {
          $set: {
            status: "expired",
          },
        },
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ Expired donations updated automatically: ${result.modifiedCount}`);
      }
    } catch (error) {
      console.error("❌ Donation Expiry Check Job Error:", error.message);
    }
  });
}
