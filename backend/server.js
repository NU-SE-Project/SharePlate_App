// server.js

import app from "./app.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB(process.env.MONGO_URI);
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

start().catch((err) => {
  console.error("❌ Failed to start server:", err); 
  process.exit(1);
});