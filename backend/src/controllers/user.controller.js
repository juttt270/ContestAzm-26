import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Get all users (with optional role and status filters)
// @route   GET /api/v1/users
// @access  Private (Admin)
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isActive, search } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(filter).populate("flatId").sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, users, "Users list retrieved successfully"));
});

// @desc    Get user by ID
// @route   GET /api/v1/users/:id
// @access  Private (Admin)
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate("flatId");
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return res.status(200).json(new ApiResponse(200, user, "User details retrieved successfully"));
});

// @desc    Update user status / role (Admin Override)
// @route   PUT /api/v1/users/:id/status
// @access  Private (Admin)
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { role, isActive, flatId, occupancyStatus } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (flatId !== undefined) user.flatId = flatId;
  if (occupancyStatus) user.occupancyStatus = occupancyStatus;

  await user.save();

  return res.status(200).json(new ApiResponse(200, user, "User status updated successfully"));
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private (Admin)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  await user.deleteOne();

  return res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});
