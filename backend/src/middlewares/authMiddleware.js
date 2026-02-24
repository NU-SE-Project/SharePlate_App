import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  // Check header exists and is Bearer token
  if (!header || !header.startsWith("Bearer ")) {
    const err = new Error("Missing or invalid Authorization header");
    err.statusCode = 401;
    return next(err);
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach to request so next middlewares/controllers can use it
    // decoded should contain { userId, role }
    req.user = decoded;

    next();
  } catch (e) {
    const err = new Error("Invalid or expired token");
    err.statusCode = 401;
    next(err);
  }
}
