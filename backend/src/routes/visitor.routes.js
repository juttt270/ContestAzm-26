import express from "express";
import {
  generateVisitorPass,
  verifyQrCodePass,
  logWalkInVisitor,
  checkoutVisitor,
  cancelVisitorPass,
  getOverstayAlerts,
  getVisitorLogs,
} from "../controllers/visitor.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.use(protect);

// Resident & Admin Pass Generation
router.post("/generate-pass", authorizeRoles("Resident", "Admin"), upload.single("photo"), generateVisitorPass);
router.put("/:id/cancel", authorizeRoles("Resident", "Admin"), cancelVisitorPass);

// Guard Terminal Verification & QR Scanning
router.post("/verify-qr", authorizeRoles("Guard", "Admin"), verifyQrCodePass);
router.post("/verify-pass", authorizeRoles("Guard", "Admin"), verifyQrCodePass);

// Walk-in Visitor Logging & Checkout
router.post("/walk-in", authorizeRoles("Guard", "Admin"), upload.single("photo"), logWalkInVisitor);
router.post("/:id/checkout", authorizeRoles("Guard", "Admin"), checkoutVisitor);
router.post("/:id/exit", authorizeRoles("Guard", "Admin"), checkoutVisitor);

// Overstay Alerts & Gate Logs
router.get("/overstay-alerts", authorizeRoles("Guard", "Admin"), getOverstayAlerts);
router.get("/", authorizeRoles("Admin", "Guard", "Resident"), getVisitorLogs);

export default router;
