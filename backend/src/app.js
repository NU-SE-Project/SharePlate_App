// app.js
import express, { json } from "express";
import cors from "cors";
import helmet from "helmet"; // Security headers - Helmet automatically adds security-related HTTP headers
import morgan from "morgan"; // Logging middleware
import rateLimit from "express-rate-limit"; // Basic rate limiting
import cookieParser from "cookie-parser"; // For parsing cookies
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

import authRoutes from "./modules/auth/authRoutes.js";
import userRoutes from "./modules/user/userRoutes.js";
import foodRoutes from "./modules/donation/shop/donationRoutes.js";
import pickupRoutes from "./modules/pickup/pickupRoutes.js";
import requestRoutes from "./modules/donation/foodbank/requestRoutes.js";

const app = express();

app.use(json({ limit: "1mb" }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// If you deploy behind proxy (Render/Railway), cookies with secure may need this
app.set("trust proxy", 1);

// CORS must allow credentials for cookies
app.use(
  cors({
    origin: true, // in production, set exact frontend domain
    credentials: true, // ✅ allow cookies
  }),
);

// Rate limit auth endpoints (basic protection)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { message: "Too many requests, try again later." },
});

// Routes
app.get("/", (req, res) => {
  res.send("API running");
});

// Routes
app.get("/", (req, res) => res.json({ message: "SharePlate API running" }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/foodsdonate", foodRoutes);
app.use("/api/pickup", pickupRoutes);
app.use("/api/request", requestRoutes);

// Global error handler
app.use(notFound);
app.use(errorHandler);

export default app;
