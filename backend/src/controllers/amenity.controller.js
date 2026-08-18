import { Amenity } from "../models/amenity.model.js";
import { AmenityBooking } from "../models/amenityBooking.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinaryUpload.js";
import { sendEmail } from "../utils/emailService.js";

// @desc    Create a new society amenity (Admin)
// @route   POST /api/v1/amenities
// @access  Private (Admin)
export const createAmenity = asyncHandler(async (req, res) => {
  const { name, description, capacity, rules, bookingFee } = req.body;

  if (!name) {
    throw new ApiError(400, "Amenity name is required.");
  }

  const existing = await Amenity.findOne({ name });
  if (existing) {
    throw new ApiError(409, `Amenity '${name}' already exists.`);
  }

  let imageData = { url: "", public_id: "" };
  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path, "smart_society/amenities");
    if (uploadResult) {
      imageData = { url: uploadResult.url, public_id: uploadResult.public_id };
    }
  }

  const amenity = await Amenity.create({
    name,
    description: description || "",
    capacity: capacity || 20,
    rules: rules || "Standard community guidelines apply.",
    bookingFee: bookingFee || 0,
    image: imageData,
  });

  return res.status(201).json(new ApiResponse(201, amenity, "Amenity created successfully"));
});

// @desc    Get all amenities
// @route   GET /api/v1/amenities
// @access  Private
export const getAllAmenities = asyncHandler(async (req, res) => {
  const amenities = await Amenity.find({ isActive: true });
  return res.status(200).json(new ApiResponse(200, amenities, "Amenities retrieved successfully"));
});

// @desc    Get a safe public subset of amenities for the marketing website (no auth required)
// @route   GET /api/v1/amenities/public
// @access  Public
export const getPublicAmenities = asyncHandler(async (req, res) => {
  const amenities = await Amenity.find({ isActive: true }).select("name description capacity bookingFee image");
  return res.status(200).json(new ApiResponse(200, amenities, "Amenities retrieved successfully"));
});

// @desc    Check Amenity Real-Time Availability & Slot Conflicts
// @route   GET /api/v1/amenities/:id/availability
// @access  Private
export const checkAmenityAvailability = asyncHandler(async (req, res) => {
  const { bookingDate } = req.query;

  if (!bookingDate) {
    throw new ApiError(400, "Please provide bookingDate (YYYY-MM-DD).");
  }

  const amenity = await Amenity.findById(req.params.id);
  if (!amenity) {
    throw new ApiError(404, "Amenity not found.");
  }

  const existingBookings = await AmenityBooking.find({
    amenityId: amenity._id,
    bookingDate,
    status: { $ne: "CANCELLED" },
  }).populate("residentId", "name");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { amenity, existingBookings },
        `Availability slot details retrieved for ${bookingDate}`
      )
    );
});

// @desc    Book Facility Slot (Resident)
// @route   POST /api/v1/amenities/:id/book
// @access  Private (Resident)
export const bookAmenity = asyncHandler(async (req, res) => {
  const { bookingDate, startTime, endTime, guestCount, notes } = req.body;

  if (!bookingDate || !startTime || !endTime) {
    throw new ApiError(400, "Please provide bookingDate, startTime (HH:mm), and endTime (HH:mm).");
  }

  const amenity = await Amenity.findById(req.params.id);
  if (!amenity || !amenity.isActive) {
    throw new ApiError(404, "Amenity facility is unavailable for booking.");
  }

  // Conflict Check for overlapping times on the same bookingDate
  const conflict = await AmenityBooking.findOne({
    amenityId: amenity._id,
    bookingDate,
    status: { $ne: "CANCELLED" },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
    ],
  });

  if (conflict) {
    throw new ApiError(
      409,
      `Time slot ${startTime} - ${endTime} is already booked on ${bookingDate}. Please choose another slot.`
    );
  }

  const booking = await AmenityBooking.create({
    amenityId: amenity._id,
    residentId: req.user._id,
    bookingDate,
    startTime,
    endTime,
    guestCount: guestCount || 1,
    notes: notes || "",
    totalFee: amenity.bookingFee || 0,
    status: "CONFIRMED",
  });

  await sendEmail({
    to: req.user.email,
    subject: `Booking Confirmed — ${amenity.name} on ${bookingDate}`,
    title: "Amenity Booking Confirmed",
    bodyHtml: `
      <p>Hi ${req.user.name},</p>
      <p>Your booking for <b>${amenity.name}</b> is confirmed.</p>
      <p><b>Date:</b> ${bookingDate}<br/><b>Time:</b> ${startTime} – ${endTime}<br/><b>Guests:</b> ${guestCount || 1}</p>
    `,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, booking, "Facility slot reserved successfully"));
});

// @desc    Get My Bookings
// @route   GET /api/v1/amenities/my-bookings
// @access  Private (Resident)
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await AmenityBooking.find({ residentId: req.user._id })
    .populate("amenityId")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, bookings, "My facility bookings retrieved"));
});
