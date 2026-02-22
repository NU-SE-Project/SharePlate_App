import express from "express";
import {
  createPickupOTP,
  verifyPickupOTP,
  resendPickupOTP,
} from "../controllers/pickupController.js";

const router = express.Router();

// Generate OTP 
router.post("/generate", createPickupOTP);

// Verify OTP (Restaurant enters OTP)
router.post("/verify", verifyPickupOTP);

// Resend OTP
router.post("/resend", resendPickupOTP);

export default router;