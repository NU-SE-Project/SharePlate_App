// config/db.js
import { connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  try {
    const conn = await connect(uri, {
      // Mongoose 6+ uses sensible defaults; these are optional but fine:
      autoIndex: process.env.NODE_ENV !== "production", // avoid heavy indexing in prod startup
    });

    console.log(
      `MongoDB connected: ${conn.connection.host}/${conn.connection.name}`,
    );
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
