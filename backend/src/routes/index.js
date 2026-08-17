import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import flatRoutes from "./flat.routes.js";
import visitorRoutes from "./visitor.routes.js";
import billingRoutes from "./billing.routes.js";
import complaintRoutes from "./complaint.routes.js";
import noticeRoutes from "./notice.routes.js";
import amenityRoutes from "./amenity.routes.js";
import emergencyRoutes from "./emergency.routes.js";
import guidelineRoutes from "./guideline.routes.js";
import auditLogRoutes from "./auditLog.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/flats", flatRoutes);
router.use("/visitors", visitorRoutes);
router.use("/bills", billingRoutes);
router.use("/complaints", complaintRoutes);
router.use("/notices", noticeRoutes);
router.use("/amenities", amenityRoutes);
router.use("/emergency", emergencyRoutes);
router.use("/guidelines", guidelineRoutes);
router.use("/audit-logs", auditLogRoutes);

export default router;
