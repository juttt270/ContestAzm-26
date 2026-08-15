import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

/** App ka aakhri middleware — har error yahin se response banta hai. */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  let error = err;

  // Mongoose ke errors ko readable ApiError me badalte hain.
  if (!(error instanceof ApiError)) {
    if (error.name === "CastError") {
      error = ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);
    } else if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      error = ApiError.badRequest("Validation failed", messages);
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];
      error = ApiError.conflict(`Duplicate value for field: ${field}`);
    } else if (error.name === "JsonWebTokenError") {
      error = ApiError.unauthorized("Invalid token");
    } else if (error.name === "TokenExpiredError") {
      error = ApiError.unauthorized("Token expired");
    } else {
      error = ApiError.internal(error.message);
    }
  }

  logger.error(`${error.statusCode} - ${error.message}`);

  res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors ?? [],
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
