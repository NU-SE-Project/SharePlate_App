import express from "express";
import {
  createPickupOTP,
} from "../controllers/pickupController.js";

const router = express.Router();

// Generate OTP 
router.post("/generate", createPickupOTP);


export default router;