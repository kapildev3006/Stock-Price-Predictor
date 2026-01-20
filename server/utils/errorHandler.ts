import { Response } from "express";
import { ZodError } from "zod";

/**
 * Standardized error response format
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: any;
}

/**
 * Send standardized error response
 */
export function sendErrorResponse(
  res: Response,
  statusCode: number,
  error: string,
  message?: string,
  details?: any
): void {
  const response: ErrorResponse = {
    success: false,
    error,
  };

  if (message) response.message = message;
  if (details) response.details = details;

  res.status(statusCode).json(response);
}

/**
 * Handle Zod validation errors
 */
export function handleValidationError(res: Response, error: ZodError): void {
  sendErrorResponse(
    res,
    400,
    "Validation failed",
    "Invalid request data",
    error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }))
  );
}

/**
 * Handle generic errors with appropriate status codes
 */
export function handleError(res: Response, error: unknown): void {
  console.error("Error:", error);

  if (error instanceof ZodError) {
    handleValidationError(res, error);
    return;
  }

  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  sendErrorResponse(res, 500, "Internal server error", message);
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(
  fn: (req: any, res: any, next?: any) => Promise<any>
) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      handleError(res, error);
    });
  };
}
