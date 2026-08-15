import { Router } from "express";
import healthRoutes from "./health.routes.js";

const router = Router();

// Naye modules ka route yahan register karein, e.g.
// router.use("/auth", authRoutes);
router.use("/health", healthRoutes);

export default router;
