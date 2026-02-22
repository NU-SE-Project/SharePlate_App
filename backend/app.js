// app.js
import express, { json } from "express";
import cors from "cors";
import helmet from "helmet"; // Security headers - Helmet automatically adds security-related HTTP headers
import morgan from "morgan"; // Logging middleware
import rateLimit from "express-rate-limit"; // Basic rate limiting
import cookieParser from "cookie-parser"; // For parsing cookies
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js";

import foodRoutes from "./routes/foodRoutes.js";
import pickupRoutes from "./routes/pickupRoutes.js";
const app = express();

app.use(json({ limit: "1mb" }));
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

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
app.use("/foodsdonate", foodRoutes);

// pickup routes
app.use("/pickup", pickupRoutes);

// Routes
app.get("/", (req, res) => {
  res.send("API running");
});

// Routes
app.get("/", (req, res) => res.json({ message: "SharePlate API running" }));

app.use("/api/auth", authLimiter, authRoutes);
// app.use("/api/users", userRoutes);

// Global error handler
app.use(notFound);
app.use(errorHandler);



export default app;
