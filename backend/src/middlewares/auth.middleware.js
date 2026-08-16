import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

/** Authenticates JWT access token from Authorization header or HTTP-Only cookie */
export const authenticate = asyncHandler(async (req, _res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.accessToken || req.cookies?.token) {
    token = req.cookies.accessToken || req.cookies.token;
  }

  if (!token) {
    throw new ApiError(401, "Authentication token is missing. Please log in.");
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new ApiError(401, "User account not found or deactivated.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Authentication token has expired. Please refresh token or log in again.");
    }
    throw new ApiError(401, "Invalid authentication token.");
  }
});

// Alias for protect
export const protect = authenticate;

/** Strict Role-Based Access Control (RBAC) middleware */
export const authorizeRoles = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required."));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access forbidden: Role '${req.user.role}' is not authorized to access this resource.`
        )
      );
    }

    next();
  };
};

// Alias for authorize
export const authorize = authorizeRoles;
