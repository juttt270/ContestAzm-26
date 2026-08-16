import express from "express";
import {
  generateMonthlyBills,
  applyOverduePenalties,
  getBills,
  payMaintenanceBill,
  getCollectionReport,
} from "../controllers/billing.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.use(protect);

router.post("/generate-monthly", authorizeRoles("Admin"), generateMonthlyBills);
router.post("/apply-penalties", authorizeRoles("Admin"), applyOverduePenalties);
router.get("/reports/collection", authorizeRoles("Admin"), getCollectionReport);
router.get("/", authorizeRoles("Admin", "Resident"), getBills);
router.post("/:id/pay", authorizeRoles("Resident"), upload.single("receipt"), payMaintenanceBill);

export default router;
