import express from "express";
import {
  generateMonthlyBills,
  applyOverduePenalties,
  getBills,
  payMaintenanceBill,
  getCollectionReport,
  checkFlatDues,
} from "../controllers/billing.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// Public marketing-site route — must be registered before the blanket protect() below.
router.get("/check", checkFlatDues);

router.use(protect);

router.post("/generate-monthly", authorizeRoles("Admin"), generateMonthlyBills);
router.post("/apply-penalties", authorizeRoles("Admin"), applyOverduePenalties);
router.get("/reports/collection", authorizeRoles("Admin"), getCollectionReport);
router.get("/", authorizeRoles("Admin", "Resident"), getBills);
router.post("/:id/pay", authorizeRoles("Resident"), upload.single("receipt"), payMaintenanceBill);

export default router;
