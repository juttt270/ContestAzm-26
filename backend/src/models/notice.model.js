import mongoose from "mongoose";

const pollOptionSchema = new mongoose.Schema(
  {
    optionText: { type: String, required: true },
    votesCount: { type: Number, default: 0 },
    votedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  }
);

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notice title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Notice content is required"],
    },
    category: {
      type: String,
      enum: ["Announcement", "Event", "Rule", "MaintenanceNotice"],
      default: "Announcement",
    },
    attachments: [
      {
        url: { type: String },
        public_id: { type: String },
      },
    ],
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetAudience: {
      type: String,
      enum: ["ALL", "OWNERS", "TENANTS"],
      default: "ALL",
    },
    isPoll: {
      type: Boolean,
      default: false,
    },
    pollOptions: [pollOptionSchema],
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Notice = mongoose.model("Notice", noticeSchema);
