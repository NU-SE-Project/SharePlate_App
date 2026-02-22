// config/db.js
import mongoose, { connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const connectDB = async () => {
  // strictQuery avoids unrecognized query fields silently passing
  mongoose.set("strictQuery", true);
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  try {
    const conn = await  mongoose.connect(uri, {
      // Mongoose 6+ uses sensible defaults; these are optional but fine:
      autoIndex: process.env.NODE_ENV !== "production", // avoid heavy indexing in prod startup
    });

    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
