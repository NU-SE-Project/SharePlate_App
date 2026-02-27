import {
  sendEmailVerification,
  verifyEmail,
  resendVerificationEmail,
} from "../services/emailVerificationService.js";

export async function sendVerification(req, res, next) {
  try {
    const result = await sendEmailVerification(req.user.userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function verifyEmailHandler(req, res, next) {
  try {
    const { token } = req.query;
    const result = await verifyEmail(token);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function resendVerification(req, res, next) {
  try {
    const { email } = req.validated.body;
    const result = await resendVerificationEmail(email);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
