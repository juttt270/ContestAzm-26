import { Guideline } from "../models/guideline.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logAudit } from "../utils/auditLogger.js";

// @desc    Publish a society guideline (Admin)
// @route   POST /api/v1/guidelines
// @access  Private (Admin)
export const createGuideline = asyncHandler(async (req, res) => {
  const { title, content, category, order } = req.body;

  if (!title || !content) {
    throw new ApiError(400, "Please provide a guideline title and content.");
  }

  const guideline = await Guideline.create({
    title,
    content,
    category: category || "General",
    order: order || 0,
    authorId: req.user._id,
  });

  await logAudit({
    action: "GUIDELINE_CREATED",
    performedBy: req.user._id,
    targetEntity: "Guideline",
    targetId: guideline._id,
    details: { title: guideline.title },
    req,
  });

  return res.status(201).json(new ApiResponse(201, guideline, "Guideline published successfully"));
});

// @desc    Get all society guidelines
// @route   GET /api/v1/guidelines
// @access  Private
export const getAllGuidelines = asyncHandler(async (req, res) => {
  const guidelines = await Guideline.find().sort({ category: 1, order: 1, createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, guidelines, "Guidelines retrieved successfully"));
});

// @desc    Update a guideline (Admin)
// @route   PUT /api/v1/guidelines/:id
// @access  Private (Admin)
export const updateGuideline = asyncHandler(async (req, res) => {
  const { title, content, category, order } = req.body;

  const guideline = await Guideline.findById(req.params.id);
  if (!guideline) {
    throw new ApiError(404, "Guideline not found.");
  }

  if (title) guideline.title = title;
  if (content) guideline.content = content;
  if (category) guideline.category = category;
  if (order !== undefined) guideline.order = order;

  await guideline.save();

  await logAudit({
    action: "GUIDELINE_UPDATED",
    performedBy: req.user._id,
    targetEntity: "Guideline",
    targetId: guideline._id,
    details: { title: guideline.title },
    req,
  });

  return res.status(200).json(new ApiResponse(200, guideline, "Guideline updated successfully"));
});

// @desc    Delete a guideline (Admin)
// @route   DELETE /api/v1/guidelines/:id
// @access  Private (Admin)
export const deleteGuideline = asyncHandler(async (req, res) => {
  const guideline = await Guideline.findById(req.params.id);
  if (!guideline) {
    throw new ApiError(404, "Guideline not found.");
  }

  await guideline.deleteOne();

  await logAudit({
    action: "GUIDELINE_DELETED",
    performedBy: req.user._id,
    targetEntity: "Guideline",
    targetId: req.params.id,
    details: { title: guideline.title },
    req,
  });

  return res.status(200).json(new ApiResponse(200, {}, "Guideline deleted successfully"));
});
