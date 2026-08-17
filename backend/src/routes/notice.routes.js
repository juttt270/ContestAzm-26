import express from "express";
import {
  createNotice,
  getAllNotices,
  voteOnPoll,
  deleteNotice,
} from "../controllers/notice.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("Admin"), upload.array("attachments", 3), createNotice);
router.get("/", authorizeRoles("Admin", "Resident", "Guard", "Staff"), getAllNotices);
router.post("/:id/vote", authorizeRoles("Resident"), voteOnPoll);
router.delete("/:id", authorizeRoles("Admin"), deleteNotice);

export default router;
