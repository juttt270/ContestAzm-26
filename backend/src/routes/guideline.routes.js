import express from "express";
import {
  createGuideline,
  getAllGuidelines,
  updateGuideline,
  deleteGuideline,
} from "../controllers/guideline.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("Admin"), createGuideline);
router.get("/", getAllGuidelines);
router.put("/:id", authorizeRoles("Admin"), updateGuideline);
router.delete("/:id", authorizeRoles("Admin"), deleteGuideline);

export default router;
