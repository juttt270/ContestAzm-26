import { EmergencyAlert } from "../models/emergencyAlert.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Trigger Emergency SOS Siren Alert (Resident, Guard, Admin)
// @route   POST /api/v1/emergency/trigger
// @access  Private
export const triggerEmergencyAlert = asyncHandler(async (req, res) => {
  const { alertType, locationDetails } = req.body;

  if (!alertType || !["Fire", "Medical", "Security", "LiftStuck", "General"].includes(alertType)) {
    throw new ApiError(400, "Please specify a valid alertType ('Fire', 'Medical', 'Security', 'LiftStuck', 'General').");
  }

  const alert = await EmergencyAlert.create({
    senderId: req.user._id,
    flatId: req.user.flatId || null,
    alertType,
    locationDetails: locationDetails || "Society Campus",
    status: "ACTIVE",
    triggeredAt: new Date(),
  });

  const populatedAlert = await EmergencyAlert.findById(alert._id)
    .populate("senderId", "name phone email role")
    .populate("flatId");

  return res.status(201).json(
    new ApiResponse(
      201,
      populatedAlert,
      `EMERGENCY ${alertType.toUpperCase()} ALERT BROADCASTED TO ALL GUARDS & ADMINS!`
    )
  );
});

// @desc    Get Active Emergency Alerts
// @route   GET /api/v1/emergency/active
// @access  Private (Admin, Guard, Resident)
export const getActiveEmergencyAlerts = asyncHandler(async (req, res) => {
  const alerts = await EmergencyAlert.find({ status: "ACTIVE" })
    .populate("senderId", "name phone role")
    .populate("flatId")
    .sort({ triggeredAt: -1 });

  return res.status(200).json(new ApiResponse(200, alerts, "Active emergency alerts retrieved"));
});

// @desc    Resolve Emergency Alert (Guard, Admin)
// @route   PUT /api/v1/emergency/:id/resolve
// @access  Private (Guard, Admin)
export const resolveEmergencyAlert = asyncHandler(async (req, res) => {
  const alert = await EmergencyAlert.findById(req.params.id);
  if (!alert) {
    throw new ApiError(404, "Emergency alert not found.");
  }

  alert.status = "RESOLVED";
  alert.resolvedBy = req.user._id;
  alert.resolvedAt = new Date();
  await alert.save();

  return res.status(200).json(new ApiResponse(200, alert, "Emergency alert status marked as RESOLVED."));
});
