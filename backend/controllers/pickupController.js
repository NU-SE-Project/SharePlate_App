import crypto from "crypto";
import Pickup from "../models/Pickup.js";

/* ===============================
   Helper Functions
=================================*/

// Generate 6 digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hash OTP
function hashOTP(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

/* ===============================
    Generate OTP (call this function in accept request )
=================================*/

export async function createPickupOTP(req, res, next) {
  try {
    const { request_id, restaurant_id, foodbank_id } = req.body;

    if (!request_id || !restaurant_id || !foodbank_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const otp = generateOTP();

    const pickup = await Pickup.create({
      request_id,
      restaurant_id,
      foodbank_id,
      otpHash: hashOTP(otp),
      otpExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    });

    return res.status(201).json({
      message: "OTP generated successfully",
      pickupId: pickup._id,
      otp, 
    });
  } catch (error) {
    next(error);
  }
}
