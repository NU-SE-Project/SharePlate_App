export function notFound(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// Central error handler
export function errorHandler(err, req, res, next) {
  // If something already set statusCode, use it, otherwise 500
  const statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV !== "production") {
    console.error("❌ ERROR:", err);
  }

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
  });
}
