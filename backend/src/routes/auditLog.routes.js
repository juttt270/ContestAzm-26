import express from "express";
import { getAuditLogs } from "../controllers/auditLog.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", authorizeRoles("Admin"), getAuditLogs);

export default router;
