import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  lookupVehicle,
  resetUserPassword,
} from "../controllers/user.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

// Gate security: vehicle lookup (must be registered before the /:id catch-all route)
router.get("/vehicles/lookup", authorizeRoles("Admin", "Guard"), lookupVehicle);

// Admin-only User Administration
router.get("/", authorizeRoles("Admin"), getAllUsers);
router.get("/:id", authorizeRoles("Admin"), getUserById);
router.put("/:id/status", authorizeRoles("Admin"), updateUserStatus);
router.put("/:id/reset-password", authorizeRoles("Admin"), resetUserPassword);
router.delete("/:id", authorizeRoles("Admin"), deleteUser);

export default router;
