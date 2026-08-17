import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logAudit } from "../utils/auditLogger.js";

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

// @desc    Look up which resident a vehicle number belongs to (Gate security check)
// @route   GET /api/v1/users/vehicles/lookup?vehicleNumber=ABC-123
// @access  Private (Admin, Guard)
export const lookupVehicle = asyncHandler(async (req, res) => {
  const { vehicleNumber } = req.query;

  if (!vehicleNumber || !vehicleNumber.trim()) {
    throw new ApiError(400, "Please provide a vehicleNumber to search.");
  }

  const cleanNumber = vehicleNumber.trim().toUpperCase();

  const user = await User.findOne({ "vehicles.vehicleNumber": cleanNumber }).populate("flatId");

  if (!user) {
    return res
      .status(200)
      .json(new ApiResponse(200, { found: false, vehicleNumber: cleanNumber }, "No registered vehicle found matching this number."));
  }

  const vehicle = user.vehicles.find((v) => v.vehicleNumber === cleanNumber);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        found: true,
        vehicle,
        resident: { name: user.name, phone: user.phone, role: user.role },
        flat: user.flatId,
      },
      "Registered vehicle found."
    )
  );
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
  const { role, isActive, flatId, occupancyStatus, profession } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const changes = {};
  if (role && role !== user.role) changes.role = { from: user.role, to: role };
  if (isActive !== undefined && isActive !== user.isActive) changes.isActive = { from: user.isActive, to: isActive };

  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (flatId !== undefined) user.flatId = flatId;
  if (occupancyStatus) user.occupancyStatus = occupancyStatus;
  if (profession !== undefined) user.profession = profession;

  await user.save();

  if (Object.keys(changes).length > 0) {
    await logAudit({
      action: "USER_STATUS_UPDATED",
      performedBy: req.user._id,
      targetEntity: "User",
      targetId: user._id,
      details: { targetUser: user.name, changes },
      req,
    });
  }

  return res.status(200).json(new ApiResponse(200, user, "User status updated successfully"));
});

// @desc    Reset a user's password (Admin override — no current password needed)
// @route   PUT /api/v1/users/:id/reset-password
// @access  Private (Admin)
export const resetUserPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, "Please provide a newPassword of at least 6 characters.");
  }

  const user = await User.findById(req.params.id).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  user.password = newPassword;
  await user.save();

  await logAudit({
    action: "PASSWORD_RESET_BY_ADMIN",
    performedBy: req.user._id,
    targetEntity: "User",
    targetId: user._id,
    details: { targetUser: user.name },
    req,
  });

  return res.status(200).json(new ApiResponse(200, {}, `Password reset for ${user.name}.`));
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

  await logAudit({
    action: "USER_DELETED",
    performedBy: req.user._id,
    targetEntity: "User",
    targetId: req.params.id,
    details: { targetUser: user.name, email: user.email },
    req,
  });

  return res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});
