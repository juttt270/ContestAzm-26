import express from "express";
import {
  createComplaint,
  getComplaints,
  assignStaffToComplaint,
  updateComplaintStatus,
} from "../controllers/complaint.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("Resident", "Admin"), upload.array("attachments", 3), createComplaint);
router.get("/", authorizeRoles("Admin", "Resident", "Staff"), getComplaints);
router.post("/:id/assign", authorizeRoles("Admin"), assignStaffToComplaint);
router.put("/:id/status", authorizeRoles("Staff", "Admin"), updateComplaintStatus);

export default router;
