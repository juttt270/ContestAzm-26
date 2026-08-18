import express from "express";
import {
  registerUser,
  registerResident,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getMyProfile,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post("/signup", registerResident);
router.post("/register", protect, authorizeRoles("Admin"), upload.single("avatar"), registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);

// Protected Auth Routes
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMyProfile);
router.put("/update-profile", protect, upload.single("avatar"), updateProfile);
router.put("/change-password", protect, changePassword);

export default router;
