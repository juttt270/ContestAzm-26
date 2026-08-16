import mongoose from "mongoose";

const amenityBookingSchema = new mongoose.Schema(
  {
    amenityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Amenity",
      required: true,
      index: true,
    },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bookingDate: {
      type: String, // format: "YYYY-MM-DD"
      required: true,
      index: true,
    },
    startTime: {
      type: String, // format: "HH:mm" e.g. "14:00"
      required: true,
    },
    endTime: {
      type: String, // format: "HH:mm" e.g. "16:00"
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
      default: "CONFIRMED",
    },
    totalFee: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index to efficiently check slot availability
amenityBookingSchema.index({ amenityId: 1, bookingDate: 1 });

export const AmenityBooking = mongoose.model("AmenityBooking", amenityBookingSchema);
