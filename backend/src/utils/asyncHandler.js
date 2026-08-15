/**
 * Async controllers ko wrap karta hai taake har rejected promise
 * apne aap error handler middleware tak pohanch jaye.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
