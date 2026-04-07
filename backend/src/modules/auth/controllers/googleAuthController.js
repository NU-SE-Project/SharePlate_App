import {
  authenticateWithGoogle,
  completeGoogleSignup,
} from "../services/authService.js";

function getCookieOptions() {
  const secure = String(process.env.COOKIE_SECURE || "false") === "true";
  const sameSite = secure ? "none" : "lax";

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, getCookieOptions());
}

/**
 * POST /api/auth/google
 */
export async function googleLogin(req, res, next) {
  try {
    const { credential } = req.validated.body;

    const result = await authenticateWithGoogle(credential, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    if (result.requiresOnboarding) {
      return res.status(200).json(result);
    }

    setRefreshCookie(res, result.refreshToken);

    res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/google/complete
 */
export async function completeGoogleOnboarding(req, res, next) {
  try {
    const result = await completeGoogleSignup(req.validated.body, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    setRefreshCookie(res, result.refreshToken);

    res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
}
