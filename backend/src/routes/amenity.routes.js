import express from "express";
import {
  createAmenity,
  getAllAmenities,
  checkAmenityAvailability,
  bookAmenity,
  getMyBookings,
} from "../controllers/amenity.controller.js";
import { protect, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("Admin"), createAmenity);
router.get("/", getAllAmenities);
router.get("/my-bookings", authorizeRoles("Resident"), getMyBookings);
router.get("/:id/availability", checkAmenityAvailability);
router.post("/:id/book", authorizeRoles("Resident"), bookAmenity);

export default router;
