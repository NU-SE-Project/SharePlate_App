import jwt from "jsonwebtoken";
import User from "../modules/user/User.js";
import RefreshToken from "../modules/auth/RefreshToken.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  // Check header exists and is Bearer token
  if (!header || !header.startsWith("Bearer ")) {
    const err = new Error("Missing or invalid Authorization header");
    err.statusCode = 401;
    return next(err);
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select("role isActive authVersion");

    if (!user || !user.isActive) {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      return next(err);
    }

    if (Number(decoded.authVersion || -1) !== Number(user.authVersion || 0)) {
      const err = new Error("Session has been revoked. Please login again.");
      err.statusCode = 401;
      return next(err);
    }

    if (!decoded.sessionId) {
      const err = new Error("Invalid session token");
      err.statusCode = 401;
      return next(err);
    }

    const session = await RefreshToken.findOne({
      _id: decoded.sessionId,
      user: user._id,
    });

    if (!session) {
      const err = new Error("Session no longer exists. Please login again.");
      err.statusCode = 401;
      return next(err);
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      authVersion: Number(user.authVersion || 0),
      sessionId: decoded.sessionId,
    };

    next();
  } catch (e) {
    const err = new Error("Invalid or expired token");
    err.statusCode = 401;
    next(err);
  }
}
