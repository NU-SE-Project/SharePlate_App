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

/* ===============================
    Verify OTP
=================================*/

export async function verifyPickupOTP(req, res, next) {
  try {
    const { pickupId, otp } = req.body;

    if (!pickupId || !otp) {
      return res.status(400).json({ message: "Pickup ID and OTP required" });
    }

    const pickup = await Pickup.findById(pickupId);

    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    if (pickup.verified) {
      return res.status(400).json({ message: "Already verified" });
    }

    const now = new Date();

    // Check expiry
    if (pickup.otpExpiresAt < now) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Check lock
    if (pickup.otpLockedUntil && pickup.otpLockedUntil > now) {
      return res.status(400).json({
        message: `Locked. Try again after ${pickup.otpLockedUntil}`,
      });
    }

    // Auto unlock if 5 mins passed
    if (pickup.otpLockedUntil && pickup.otpLockedUntil <= now) {
      pickup.otpAttempts = 0;
      pickup.otpLockedUntil = null;
    }

    const hashedInput = hashOTP(otp);

    if (hashedInput !== pickup.otpHash) {
      pickup.otpAttempts += 1;

      if (pickup.otpAttempts >= 3) {
        pickup.otpLockedUntil = new Date(Date.now() + 5 * 60 * 1000);
      }

      await pickup.save();

      return res.status(400).json({
        message: "Invalid OTP",
        attemptsLeft:
          3 - pickup.otpAttempts > 0 ? 3 - pickup.otpAttempts : 0,
      });
    }

    // Correct OTP
    pickup.verified = true;
    pickup.verifiedAt = new Date();
    pickup.status = "verified";

    await pickup.save();

    return res.status(200).json({
      message: "Pickup verified successfully",
    });
  } catch (error) {
    next(error);
  }
}

/* ===============================
    Resend OTP
=================================*/

export async function resendPickupOTP(req, res, next) {
  try {
    const { pickupId } = req.body;

    const pickup = await Pickup.findById(pickupId);

    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    if (pickup.verified) {
      return res.status(400).json({ message: "Already verified" });
    }

    const newOtp = generateOTP();

    pickup.otpHash = hashOTP(newOtp);
    pickup.otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    pickup.otpAttempts = 0;
    pickup.otpLockedUntil = null;

    await pickup.save();

    return res.status(200).json({
      message: "New OTP generated",
      otp: newOtp, // remove later in production
    });
  } catch (error) {
    next(error);
  }
}

