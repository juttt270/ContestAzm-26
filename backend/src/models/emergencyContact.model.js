import mongoose from "mongoose";

const emergencyContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Contact name is required"],
      trim: true,
    },
    designation: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Contact phone number is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["Society Office", "Security", "Ambulance", "Fire", "Police", "Maintenance", "Other"],
      default: "Other",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const EmergencyContact = mongoose.model("EmergencyContact", emergencyContactSchema);
