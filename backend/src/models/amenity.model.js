import mongoose from "mongoose";

const amenitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Amenity name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    capacity: {
      type: Number,
      default: 20,
    },
    rules: {
      type: String,
      default: "Standard community rules apply.",
    },
    bookingFee: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    image: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export const Amenity = mongoose.model("Amenity", amenitySchema);
