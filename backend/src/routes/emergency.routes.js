import express from "express";
import {
  triggerEmergencyAlert,
  getActiveEmergencyAlerts,
  resolveEmergencyAlert,
  getEmergencyContacts,
  createEmergencyContact,
  deleteEmergencyContact,
} from "../controllers/emergency.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/trigger", triggerEmergencyAlert);
router.get("/active", getActiveEmergencyAlerts);
router.put("/:id/resolve", authorizeRoles("Guard", "Admin"), resolveEmergencyAlert);

router.get("/contacts", getEmergencyContacts);
router.post("/contacts", authorizeRoles("Admin"), createEmergencyContact);
router.delete("/contacts/:id", authorizeRoles("Admin"), deleteEmergencyContact);

export default router;
