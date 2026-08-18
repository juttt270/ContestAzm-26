import { EmergencyAlert } from "../models/emergencyAlert.model.js";
import { EmergencyContact } from "../models/emergencyContact.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logAudit } from "../utils/auditLogger.js";
import { sendBulkEmail } from "../utils/emailService.js";

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

  const notifyTargets = await User.find({ role: { $in: ["Guard", "Admin"] }, isActive: true }).select("email");
  await sendBulkEmail({
    recipients: notifyTargets.map((u) => u.email),
    subject: `🚨 EMERGENCY: ${alertType.toUpperCase()} — Immediate Attention Required`,
    title: `Emergency SOS: ${alertType}`,
    bodyHtml: `
      <p><b>${req.user.name}</b> has triggered a <b>${alertType}</b> emergency alert.</p>
      <p><b>Location:</b> ${populatedAlert.locationDetails}</p>
      <p><b>Flat:</b> ${populatedAlert.flatId ? `${populatedAlert.flatId.blockName}-${populatedAlert.flatId.flatNumber}` : "N/A"}</p>
      <p><b>Contact:</b> ${req.user.phone}</p>
      <p style="color:#dc2626;font-weight:600;">Please respond immediately.</p>
    `,
  });

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

  await logAudit({
    action: "EMERGENCY_ALERT_RESOLVED",
    performedBy: req.user._id,
    targetEntity: "EmergencyAlert",
    targetId: alert._id,
    details: { alertType: alert.alertType, locationDetails: alert.locationDetails },
    req,
  });

  return res.status(200).json(new ApiResponse(200, alert, "Emergency alert status marked as RESOLVED."));
});

// @desc    Get the society emergency contact directory (office, security, ambulance, etc.)
// @route   GET /api/v1/emergency/contacts
// @access  Private
export const getEmergencyContacts = asyncHandler(async (req, res) => {
  const contacts = await EmergencyContact.find({ isActive: true }).sort({ type: 1, name: 1 });
  return res.status(200).json(new ApiResponse(200, contacts, "Emergency contact directory retrieved"));
});

// @desc    Add a contact to the emergency directory (Admin)
// @route   POST /api/v1/emergency/contacts
// @access  Private (Admin)
export const createEmergencyContact = asyncHandler(async (req, res) => {
  const { name, designation, phone, type } = req.body;

  if (!name || !phone) {
    throw new ApiError(400, "Please provide a contact name and phone number.");
  }

  const contact = await EmergencyContact.create({
    name,
    designation: designation || "",
    phone,
    type: type || "Other",
  });

  return res.status(201).json(new ApiResponse(201, contact, "Emergency contact added successfully"));
});

// @desc    Remove a contact from the emergency directory (Admin)
// @route   DELETE /api/v1/emergency/contacts/:id
// @access  Private (Admin)
export const deleteEmergencyContact = asyncHandler(async (req, res) => {
  const contact = await EmergencyContact.findById(req.params.id);
  if (!contact) {
    throw new ApiError(404, "Emergency contact not found.");
  }

  await contact.deleteOne();

  return res.status(200).json(new ApiResponse(200, {}, "Emergency contact removed successfully"));
});
