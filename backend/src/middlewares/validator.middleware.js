import ApiError from "../utils/ApiError.js";

/**
 * Middleware factory for field validations.
 * Accepts a validation function and applies it to req.body.
 */
export const validateBody = (validatorFn) => {
  return (req, _res, next) => {
    const errors = validatorFn(req.body);
    if (errors && errors.length > 0) {
      return next(new ApiError(400, "Validation failed for request payload", errors));
    }
    next();
  };
};
