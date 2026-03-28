// server.js
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import dotenv from "dotenv";
import { startOtpCleanupJob } from "./src/utils/otpCleanupJob.js";
import { initSocket } from "./src/socket.js";
import http from "http";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB(process.env.MONGO_URI);
  startOtpCleanupJob(); // Start background clear otp job

  // create HTTP server and attach Socket.IO to the same server
  const server = http.createServer(app);
  const io = initSocket(server);

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [Started at: ${new Date().toISOString()}]`);
    console.log(`📍 DISTANCE_KM: ${process.env.DISTANCE_KM}`);
  });
}

start().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
