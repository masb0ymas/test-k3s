import { Request, Response, NextFunction } from "express";

interface ApiError extends Error {
  statusCode?: number;
  code?: number;
  body?: {
    message?: string;
    reason?: string;
  };
}

export function errorMiddleware(
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error("Error:", err);

  // Handle Kubernetes API errors
  if (err.body?.message) {
    const statusCode = err.code || err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: err.body.message,
      reason: err.body.reason,
    });
    return;
  }

  // Handle Zod validation errors
  if (err.name === "ZodError") {
    res.status(400).json({
      success: false,
      error: "Validation error",
      details: err,
    });
    return;
  }

  // Generic error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal server error",
  });
}
