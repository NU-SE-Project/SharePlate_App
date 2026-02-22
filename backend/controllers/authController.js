import {
  registerUser,
  loginUser,
  refreshSession,
  logoutByRefreshToken,
  logoutAllSessions,
} from "../services/authService.js";

// Cookie helpers
function setRefreshCookie(res, token) {
  const secure = String(process.env.COOKIE_SECURE || "false") === "true";

  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure, // true in HTTPS production
    sameSite: "none", // for cross-site frontend you may need "none"
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
}

function clearRefreshCookie(res) {
  const secure = String(process.env.COOKIE_SECURE || "false") === "true";

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure,
    sameSite: "none",
    path: "/api/auth",
  });
}

export async function register(req, res, next) {
  try {
    const user = await registerUser(req.validated.body);
    res.status(201).json({ message: "Registered successfully", user });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.validated.body;

    // Meta for audit (optional)
    const meta = {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    };

    const result = await loginUser(email, password, meta);

    // Save refresh token in httpOnly cookie
    setRefreshCookie(res, result.refreshToken);

    // Only return access token + user
    res
      .status(200)
      .json({ accessToken: result.accessToken, user: result.user });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    const result = await refreshSession(token);

    // Rotate refresh cookie
    setRefreshCookie(res, result.refreshToken);

    res
      .status(200)
      .json({ accessToken: result.accessToken, user: result.user });
  } catch (err) {
    next(err);
  }
}
