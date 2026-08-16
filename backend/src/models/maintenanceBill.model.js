import mongoose from "mongoose";

const breakdownSchema = new mongoose.Schema(
  {
    waterCharges: { type: Number, default: 500 },
    securityCharges: { type: Number, default: 800 },
    repairCharges: { type: Number, default: 400 },
    commonAreaCharges: { type: Number, default: 800 },
  },
  { _id: false }
);

const maintenanceBillSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    flatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      required: true,
      index: true,
    },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    billingMonth: {
      type: String, // e.g. "2026-08"
      required: true,
      index: true,
    },
    amountDue: {
      type: Number,
      required: true,
    },
    breakdown: {
      type: breakdownSchema,
      default: () => ({}),
    },
    dueDate: {
      type: Date,
      required: true,
    },
    penaltyAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "OVERDUE"],
      default: "PENDING",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["SIMULATED_CARD", "UPI", "NET_BANKING", "CASH", "NONE"],
      default: "NONE",
    },
    paymentReceipt: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    transactionId: {
      type: String,
      default: "",
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const MaintenanceBill = mongoose.model("MaintenanceBill", maintenanceBillSchema);
