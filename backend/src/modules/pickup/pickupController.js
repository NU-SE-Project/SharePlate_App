import {
  createPickupOTPService,
  verifyPickupOTPService,
  resendPickupOTPService,
  getPickupByIdService,
} from "./pickupService.js";

export async function createPickupOTP(req, res, next) {
  try {
    const { request_id, restaurant_id, foodbank_id } = req.body;
    const { pickup, otp } = await createPickupOTPService({ request_id, restaurant_id, foodbank_id });
    return res.status(201).json({ message: "OTP generated successfully", pickupId: pickup._id, otp });
  } catch (error) {
    return next(error);
  }
}

export async function verifyPickupOTP(req, res, next) {
  try {
    const { pickupId, otp } = req.body;
    const result = await verifyPickupOTPService({ pickupId, otp });
    return res.status(200).json(result);
  } catch (error) {
    if (error.attemptsLeft !== undefined) {
      return res.status(error.statusCode || 400).json({ message: error.message, attemptsLeft: error.attemptsLeft });
    }
    return next(error);
  }
}

export async function resendPickupOTP(req, res, next) {
  try {
    const { pickupId } = req.body;
    const result = await resendPickupOTPService({ pickupId });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function getPickupById(req, res, next) {
  try {
    const pickup = await getPickupByIdService(req.params.id);
    return res.status(200).json(pickup);
  } catch (error) {
    return next(error);
  }
}
