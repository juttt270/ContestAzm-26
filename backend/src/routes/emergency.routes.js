import express from "express";
import {
  triggerEmergencyAlert,
  getActiveEmergencyAlerts,
  resolveEmergencyAlert,
} from "../controllers/emergency.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/trigger", triggerEmergencyAlert);
router.get("/active", getActiveEmergencyAlerts);
router.put("/:id/resolve", authorizeRoles("Guard", "Admin"), resolveEmergencyAlert);

export default router;
