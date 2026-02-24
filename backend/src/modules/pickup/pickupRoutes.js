import express from "express";
import {
  createPickupOTP,
  verifyPickupOTP,
  resendPickupOTP,
  getPickupById,
} from "./pickupController.js";

const router = express.Router();

// Generate OTP
router.post("/generate", createPickupOTP);

// Verify OTP (Restaurant enters OTP)
router.post("/verify", verifyPickupOTP);

// Resend OTP
router.post("/resend", resendPickupOTP);

// Get Pickup details
router.get("/:id", getPickupById);

export default router;
