import { AuditLog } from "../models/auditLog.model.js";

/** Records an immutable audit trail entry. Never throws — logging must not block the primary action. */
export const logAudit = async ({ action, performedBy, targetEntity, targetId, details, req }) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      targetEntity,
      targetId: targetId ? String(targetId) : null,
      details: details || {},
      ipAddress: req?.ip || req?.headers?.["x-forwarded-for"] || "",
    });
  } catch {
    // best-effort — swallow so a logging failure never breaks the real request
  }
};
