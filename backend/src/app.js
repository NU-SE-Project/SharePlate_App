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
import notificationRoutes from "./modules/notification/notificationRoutes.js";
import foodrequestRoutes from "./modules/request/foodbank/foodrequestRoutes.js"
import acceptsfoodrequestRoutes from './modules/request/shop/acceptsfoodrequestRoutes.js'
import distancetestRoutes from './modules/testing/distancetestRoute.js';
import complainRoutes from "./modules/complain/complainRoutes.js";
import dashboardRoutes from "./modules/dashboard/dashboardRoutes.js";
import settingsRoutes from "./modules/settings/settingsRoutes.js";
import { buildPublicAppUrl } from "./utils/publicAppUrl.js";

const app = express();

app.use(json({ limit: "1mb" }));
app.use(cookieParser());

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
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

// Serve uploaded files after CORS so responses include CORS headers
import path from 'path';
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Rate limit auth endpoints (basic protection)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { message: "Too many requests, try again later." },
});

// Routes
app.get("/api", (req, res) => {
  res.send("API running");
});

// Routes
app.get("/", (req, res) => res.json({ message: "SharePlate API running" }));

// Public browser-entry compatibility routes for email links.
// These redirect to the frontend pages, which then call the API routes.
app.get("/verify-email", (req, res) => {
  res.redirect(302, buildPublicAppUrl("/verify-email", { token: req.query.token }));
});

app.get("/reset-password", (req, res) => {
  res.redirect(302, buildPublicAppUrl("/reset-password", { token: req.query.token }));
});

// Auth and user routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/user", userRoutes);

// resturant food donation routes
app.use("/api/foodsdonate", foodRoutes);


app.use("/api/pickup", pickupRoutes);

// Foodbank request food posted by restaurants
app.use("/api/request", requestRoutes);

// Foodbank request food to resturants
app.use("/api/foodbank-request", foodrequestRoutes);

// resturants accepts the request posted by foodbank
app.use("/api/accepts/foodbank-request", acceptsfoodrequestRoutes);

// Notifications
app.use("/api/notifications", notificationRoutes);

// Testing route for distance calculation using maps and horizontal distance calculation
app.use("/api/nearby", distancetestRoutes);

// Complaint system routes
app.use("/api/complaints", complainRoutes);

// Dashboard Routes
app.use("/api/dashboard", dashboardRoutes);

// Settings Routes
app.use("/api/settings", settingsRoutes);

// Global error handler
app.use(notFound);
app.use(errorHandler);

export default app;
