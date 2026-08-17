import { AuditLog } from "../models/auditLog.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Get audit log trail (security actions, financial edits, status changes)
// @route   GET /api/v1/audit-logs
// @access  Private (Admin)
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { action, targetEntity } = req.query;
  const filter = {};

  if (action) filter.action = action;
  if (targetEntity) filter.targetEntity = targetEntity;

  const logs = await AuditLog.find(filter)
    .populate("performedBy", "name email role")
    .sort({ createdAt: -1 })
    .limit(500);

  return res.status(200).json(new ApiResponse(200, logs, "Audit logs retrieved successfully"));
});
