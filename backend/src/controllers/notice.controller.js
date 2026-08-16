import { Notice } from "../models/notice.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinaryUpload.js";

// @desc    Create a new society notice or poll (Admin)
// @route   POST /api/v1/notices
// @access  Private (Admin)
export const createNotice = asyncHandler(async (req, res) => {
  const { title, content, category, targetAudience, isPoll, pollOptions, expiresAt } = req.body;

  if (!title || !content) {
    throw new ApiError(400, "Please provide notice title and content.");
  }

  const attachments = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const uploadResult = await uploadOnCloudinary(file.path, "smart_society/notices");
      if (uploadResult) {
        attachments.push({ url: uploadResult.url, public_id: uploadResult.public_id });
      }
    }
  }

  let formattedPollOptions = [];
  if (isPoll && Array.isArray(pollOptions)) {
    formattedPollOptions = pollOptions.map((opt) => ({
      optionText: typeof opt === "string" ? opt : opt.optionText,
      votesCount: 0,
      votedUserIds: [],
    }));
  }

  const notice = await Notice.create({
    title,
    content,
    category: category || "Announcement",
    targetAudience: targetAudience || "ALL",
    authorId: req.user._id,
    attachments,
    isPoll: !!isPoll,
    pollOptions: formattedPollOptions,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  });

  return res.status(201).json(new ApiResponse(201, notice, "Notice published successfully"));
});

// @desc    Get all active notices (Admin, Resident, Guard, Staff)
// @route   GET /api/v1/notices
// @access  Private
export const getAllNotices = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = {};

  if (category) filter.category = category;

  const notices = await Notice.find(filter)
    .populate("authorId", "name email role")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, notices, "Notices list retrieved successfully"));
});

// @desc    Vote in a community poll (Resident)
// @route   POST /api/v1/notices/:id/vote
// @access  Private (Resident)
export const voteOnPoll = asyncHandler(async (req, res) => {
  const { optionId } = req.body;

  if (!optionId) {
    throw new ApiError(400, "Please provide poll optionId.");
  }

  const notice = await Notice.findById(req.params.id);
  if (!notice) {
    throw new ApiError(404, "Notice or Poll not found.");
  }

  if (!notice.isPoll) {
    throw new ApiError(400, "This notice is not a poll.");
  }

  // Check if user has already voted in any option of this poll
  const hasVoted = notice.pollOptions.some((opt) =>
    opt.votedUserIds.some((uid) => uid.toString() === req.user._id.toString())
  );

  if (hasVoted) {
    throw new ApiError(400, "You have already cast your vote in this poll.");
  }

  const targetOption = notice.pollOptions.id(optionId);
  if (!targetOption) {
    throw new ApiError(404, "Selected poll option not found.");
  }

  targetOption.votesCount += 1;
  targetOption.votedUserIds.push(req.user._id);

  await notice.save();

  return res.status(200).json(new ApiResponse(200, notice, "Vote recorded successfully"));
});
