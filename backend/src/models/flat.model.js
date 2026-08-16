import mongoose from "mongoose";

const flatSchema = new mongoose.Schema(
  {
    blockName: {
      type: String,
      required: [true, "Block / Wing name is required"],
      trim: true,
      uppercase: true,
    },
    flatNumber: {
      type: String,
      required: [true, "Flat / Unit number is required"],
      trim: true,
      uppercase: true,
    },
    floor: {
      type: Number,
      required: [true, "Floor number is required"],
      min: 0,
    },
    occupancyType: {
      type: String,
      enum: ["Owner", "Tenant", "Vacant"],
      default: "Vacant",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    maintenanceRate: {
      type: Number,
      required: [true, "Monthly maintenance rate is required"],
      default: 2500,
    },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness per block and flat number
flatSchema.index({ blockName: 1, flatNumber: 1 }, { unique: true });

export const Flat = mongoose.model("Flat", flatSchema);
