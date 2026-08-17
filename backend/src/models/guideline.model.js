import mongoose from "mongoose";

const guidelineSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Guideline title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Guideline content is required"],
    },
    category: {
      type: String,
      enum: ["General", "Safety", "Parking", "Amenities", "Maintenance", "Pets"],
      default: "General",
    },
    order: {
      type: Number,
      default: 0,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Guideline = mongoose.model("Guideline", guidelineSchema);
