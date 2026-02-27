import crypto from "crypto";
import Pickup from "./Pickup.js";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOTP(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function createPickupOTPService({ request_id, restaurant_id, foodbank_id }) {
  if (!request_id || !restaurant_id || !foodbank_id) {
    const err = new Error("Missing required fields");
    err.statusCode = 400;
    throw err;
  }

  const otp = generateOTP();

  const pickup = await Pickup.create({
    request_id,
    restaurant_id,
    foodbank_id,
    otpHash: hashOTP(otp),
    otpExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  return { pickup, otp };
}

export async function verifyPickupOTPService({ pickupId, otp }) {
  if (!pickupId || !otp) {
    const err = new Error("Pickup ID and OTP required");
    err.statusCode = 400;
    throw err;
  }

  const pickup = await Pickup.findById(pickupId);
  if (!pickup) {
    const err = new Error("Pickup not found");
    err.statusCode = 404;
    throw err;
  }

  if (pickup.verified) {
    const err = new Error("Already verified");
    err.statusCode = 400;
    throw err;
  }

  if (!pickup.otpHash) {
    const err = new Error("No active OTP. Please resend.");
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();

  if (pickup.otpExpiresAt && pickup.otpExpiresAt < now) {
    const err = new Error("OTP expired");
    err.statusCode = 400;
    throw err;
  }

  if (pickup.otpLockedUntil && pickup.otpLockedUntil > now) {
    const err = new Error(`Locked. Try again after ${pickup.otpLockedUntil}`);
    err.statusCode = 400;
    throw err;
  }

  if (pickup.otpLockedUntil && pickup.otpLockedUntil <= now) {
    pickup.otpAttempts = 0;
    pickup.otpLockedUntil = null;
  }

  const hashedInput = hashOTP(otp);
  if (hashedInput !== pickup.otpHash) {
    pickup.otpAttempts = (pickup.otpAttempts || 0) + 1;
    if (pickup.otpAttempts >= 3) {
      pickup.otpLockedUntil = new Date(Date.now() + 5 * 60 * 1000);
    }
    await pickup.save();

    const attemptsLeft = 3 - pickup.otpAttempts > 0 ? 3 - pickup.otpAttempts : 0;
    const err = new Error("Invalid OTP");
    err.statusCode = 400;
    err.attemptsLeft = attemptsLeft;
    throw err;
  }

  pickup.verified = true;
  pickup.verifiedAt = new Date();
  pickup.status = "verified";
  pickup.otpHash = null;
  await pickup.save();

  return { message: "Pickup verified successfully" };
}

export async function resendPickupOTPService({ pickupId }) {
  const pickup = await Pickup.findById(pickupId);
  if (!pickup) {
    const err = new Error("Pickup not found");
    err.statusCode = 404;
    throw err;
  }

  if (pickup.verified) {
    const err = new Error("Already verified");
    err.statusCode = 400;
    throw err;
  }

  const newOtp = generateOTP();
  pickup.otpHash = hashOTP(newOtp);
  pickup.otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  pickup.otpAttempts = 0;
  pickup.otpLockedUntil = null;
  await pickup.save();

  return { message: "New OTP generated", otp: newOtp };
}

export async function getPickupByIdService(id) {
  const pickup = await Pickup.findById(id);
  if (!pickup) {
    const err = new Error("Pickup not found");
    err.statusCode = 404;
    throw err;
  }
  return pickup;
}
