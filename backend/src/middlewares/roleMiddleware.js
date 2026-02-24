export function allowRoles(...allowedRoles) {
  return (req, res, next) => {
    // requireAuth must run before this, so req.user exists
    if (!req.user?.role) {
      const err = new Error("Unauthorized");
      err.statusCode = 401; // 401 = “not logged in / token invalid”
      return next(err);
    }

    if (!allowedRoles.includes(req.user.role)) {
      const err = new Error("Forbidden: insufficient permissions");
      err.statusCode = 403; // 403 = “logged in but role not permitted”
      return next(err);
    }

    next();
  };
}
