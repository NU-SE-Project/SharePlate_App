import Pickup from "./Pickup.js";
import Acceptance from "../request/shop/Acceptance.js";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
    otp,
    otpExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiry
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

  if (pickup.status === "expired") {
    const err = new Error("OTP has expired");
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();

  // Check if actually expired
  if (pickup.otpExpiresAt && pickup.otpExpiresAt < now) {
    pickup.status = "expired";
    await pickup.save();

    // Also update acceptance status
    await Acceptance.findOneAndUpdate(
      { pickup_id: pickup._id },
      { status: "expired" }
    );

    const err = new Error("OTP expired");
    err.statusCode = 400;
    throw err;
  }

  if (!pickup.otp) {
    const err = new Error("No active OTP. Please resend.");
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

  if (otp !== pickup.otp) {
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
  pickup.otp = null; // Clear OTP after verification
  await pickup.save();

  // Update related Acceptance
  await Acceptance.findOneAndUpdate(
    { pickup_id: pickup._id },
    { status: "delivered" }
  );

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
  pickup.otp = newOtp;
  pickup.otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  pickup.otpAttempts = 0;
  pickup.otpLockedUntil = null;
  pickup.status = "generated";
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
