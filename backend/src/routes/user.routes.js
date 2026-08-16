import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
} from "../controllers/user.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

// Admin-only User Administration
router.get("/", authorizeRoles("Admin"), getAllUsers);
router.get("/:id", authorizeRoles("Admin"), getUserById);
router.put("/:id/status", authorizeRoles("Admin"), updateUserStatus);
router.delete("/:id", authorizeRoles("Admin"), deleteUser);

export default router;
