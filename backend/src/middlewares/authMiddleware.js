import jwt from "jsonwebtoken";
import User from "../modules/user/User.js";
import RefreshToken from "../modules/auth/RefreshToken.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  const debugAuthFailure = (reason, extra = {}) => {
    if (process.env.NODE_ENV === "production") return;

    console.error("[requireAuth]", {
      reason,
      method: req.method,
      url: req.originalUrl,
      hasAuthorizationHeader: Boolean(header),
      authorizationPreview:
        typeof header === "string" ? `${header.slice(0, 24)}...` : null,
      ...extra,
    });
  };

  // Check header exists and is Bearer token
  if (!header || !header.startsWith("Bearer ")) {
    debugAuthFailure("missing_or_invalid_authorization_header");
    const err = new Error("Missing or invalid Authorization header");
    err.statusCode = 401;
    return next(err);
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select("role isActive authVersion");

    if (!user || !user.isActive) {
      debugAuthFailure("user_not_found_or_inactive", {
        decodedUserId: decoded.userId || null,
      });
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      return next(err);
    }

    if (Number(decoded.authVersion ?? -1) !== Number(user.authVersion ?? 0)) {
      debugAuthFailure("auth_version_mismatch", {
        decodedUserId: decoded.userId || null,
        decodedAuthVersion: Number(decoded.authVersion ?? -1),
        currentAuthVersion: Number(user.authVersion ?? 0),
      });
      const err = new Error("Session has been revoked. Please login again.");
      err.statusCode = 401;
      return next(err);
    }

    if (!decoded.sessionId) {
      debugAuthFailure("missing_session_id", {
        decodedUserId: decoded.userId || null,
      });
      const err = new Error("Invalid session token");
      err.statusCode = 401;
      return next(err);
    }

    const session = await RefreshToken.findOne({
      _id: decoded.sessionId,
      user: user._id,
    });

    if (!session) {
      debugAuthFailure("session_not_found", {
        decodedUserId: decoded.userId || null,
        decodedSessionId: decoded.sessionId || null,
      });
      const err = new Error("Session no longer exists. Please login again.");
      err.statusCode = 401;
      return next(err);
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      authVersion: Number(user.authVersion ?? 0),
      sessionId: decoded.sessionId,
    };

    next();
  } catch (e) {
    debugAuthFailure("token_verification_failed", {
      tokenError: e?.message || String(e),
    });
    const err = new Error("Invalid or expired token");
    err.statusCode = 401;
    next(err);
  }
}
