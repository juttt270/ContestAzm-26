import express from "express";
import {
  createFlat,
  getAllFlats,
  assignResidentToFlat,
  getOccupancyMap,
} from "../controllers/flat.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("Admin"), createFlat);
router.get("/", authorizeRoles("Admin", "Resident", "Guard"), getAllFlats);
router.get("/occupancy-map", authorizeRoles("Admin"), getOccupancyMap);
router.post("/:id/assign", authorizeRoles("Admin"), assignResidentToFlat);

export default router;
