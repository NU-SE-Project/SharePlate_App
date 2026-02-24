// server.js
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import dotenv from "dotenv";
import { startOtpCleanupJob } from "./src/utils/otpCleanupJob.js";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB(process.env.MONGO_URI);
  startOtpCleanupJob(); // Start background clear otp job
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

start().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
