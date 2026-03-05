const errorMiddleware = (err, req, res, next) => {
  console.error("🔥 Error Middleware:", err.message);

  // Handle JSON parse errors specifically
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format",
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorMiddleware;
