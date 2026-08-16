import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    passCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    qrToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    qrCodeDataUrl: {
      type: String,
      default: "",
    },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetFlatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      required: true,
      index: true,
    },
    visitorName: {
      type: String,
      required: [true, "Visitor name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Visitor phone number is required"],
      trim: true,
    },
    vehicleNumber: {
      type: String,
      default: "N/A",
      uppercase: true,
      trim: true,
    },
    purpose: {
      type: String,
      default: "Personal Visit",
      trim: true,
    },
    visitorType: {
      type: String,
      enum: ["Guest", "Delivery", "Cab", "Vendor", "Service"],
      default: "Guest",
    },
    photo: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    validFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        "APPROVED", "CHECKED_IN", "COMPLETED", "EXPIRED", "CANCELLED",
        "Pending", "Approved", "Checked-In", "Checked-Out", "Expired", "Cancelled"
      ],
      default: "APPROVED",
      index: true,
    },
    checkedInAt: { type: Date, default: null },
    checkedOutAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Virtual getters for checkInTime and checkOutTime compatibility
visitorSchema.virtual("checkInTime").get(function () {
  return this.checkedInAt;
});

visitorSchema.virtual("checkOutTime").get(function () {
  return this.checkedOutAt;
});

visitorSchema.set("toJSON", { virtuals: true });
visitorSchema.set("toObject", { virtuals: true });

export const Visitor = mongoose.model("Visitor", visitorSchema);
