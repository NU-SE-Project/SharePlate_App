import express from "express";
import {
  createPickupOTP,
  verifyPickupOTP,
  resendPickupOTP,
  getPickupById,
} from "./pickupController.js";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import { allowRoles } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

// Generate OTP
router.post("/generate", requireAuth, allowRoles("restaurant"), createPickupOTP); 

// Verify OTP (Restaurant enters OTP)
router.post("/verify", requireAuth, allowRoles("restaurant"), verifyPickupOTP);

// Resend OTP
router.post("/resend", requireAuth, allowRoles("restaurant"), resendPickupOTP);

// Get Pickup details
router.get("/:id", requireAuth, allowRoles("admin", "restaurant", "foodbank"), getPickupById);

export default router;
