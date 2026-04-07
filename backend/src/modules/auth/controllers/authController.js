
import {
  registerUser,
  loginUser,
  refreshSession,
  logoutByRefreshToken,
  logoutAllSessions,
} from "../services/authService.js";

/**
 * Cookie options:
 * - sameSite="none" MUST have secure=true (browser requirement)
 * - local dev (http) should use sameSite="lax", secure=false
 */
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

function clearRefreshCookie(res) {
  const opts = getCookieOptions();
  res.clearCookie("refreshToken", {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
  });
}

/**
 * POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    const user = await registerUser(req.validated.body);
    res.status(201).json({ message: "Registered successfully", user });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.validated.body;

    const meta = {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    };

    const result = await loginUser(email, password, meta);

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
 * POST /api/auth/refresh
 */
export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    const result = await refreshSession(token);

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
 * POST /api/auth/logout
 * logs out current session/device based on refresh cookie
 */
export async function logout(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;

    await logoutByRefreshToken(token);
    clearRefreshCookie(res);

    res.status(200).json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout-all
 * requires access token (requireAuth)
 */
export async function logoutAll(req, res, next) {
  try {
    await logoutAllSessions(req.user.userId);
    clearRefreshCookie(res);

    res.status(200).json({ message: "Logged out from all devices" });
  } catch (err) {
    next(err);
  }
}
