import mongoose from "mongoose";

const emergencyAlertSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    flatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      default: null,
    },
    alertType: {
      type: String,
      enum: ["Fire", "Medical", "Security", "LiftStuck", "General"],
      required: true,
    },
    locationDetails: {
      type: String,
      default: "Society Campus",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "RESOLVED"],
      default: "ACTIVE",
      index: true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    triggeredAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const EmergencyAlert = mongoose.model("EmergencyAlert", emergencyAlertSchema);
