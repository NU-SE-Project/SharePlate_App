import express from "express";
import {
  createPickupOTP,
  verifyPickupOTP,
} from "../controllers/pickupController.js";

const router = express.Router();

// Generate OTP 
router.post("/generate", createPickupOTP);

// Verify OTP (Restaurant enters OTP)
router.post("/verify", verifyPickupOTP);

export default router;