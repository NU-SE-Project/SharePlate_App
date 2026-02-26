import {
  requestPasswordReset,
  resetPassword,
  changePassword,
  validateResetToken,
} from "./passwordService.js";

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.validated.body;
    const result = await requestPasswordReset(email);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordHandler(req, res, next) {
  try {
    const { token, password } = req.validated.body;
    const result = await resetPassword(token, password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function changePasswordHandler(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.validated.body;
    const result = await changePassword(
      req.user.userId,
      currentPassword,
      newPassword,
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function validateResetTokenHandler(req, res, next) {
  try {
    const { token } = req.query;
    const result = await validateResetToken(token);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
