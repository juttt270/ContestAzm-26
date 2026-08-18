import express from "express";
import {
  createAmenity,
  getAllAmenities,
  getPublicAmenities,
  checkAmenityAvailability,
  bookAmenity,
  getMyBookings,
} from "../controllers/amenity.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// Public marketing-site route — must be registered before the blanket protect() below.
router.get("/public", getPublicAmenities);

router.use(protect);

router.post("/", authorizeRoles("Admin"), upload.single("image"), createAmenity);
router.get("/", getAllAmenities);
router.get("/my-bookings", authorizeRoles("Resident"), getMyBookings);
router.get("/:id/availability", checkAmenityAvailability);
router.post("/:id/book", authorizeRoles("Resident"), bookAmenity);

export default router;
