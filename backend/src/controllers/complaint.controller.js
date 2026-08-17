import { Complaint } from "../models/complaint.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinaryUpload.js";
import { logAudit } from "../utils/auditLogger.js";

/** Helper to generate ticket number */
const generateTicketNumber = () => {
  return `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
};

// @desc    Create a new complaint/ticket (Resident)
// @route   POST /api/v1/complaints
// @access  Private (Resident, Admin)
export const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, priority } = req.body;

  if (!title || !description || !category) {
    throw new ApiError(400, "Please provide ticket title, description, and category.");
  }

  const flatId = req.user.flatId;
  if (!flatId && req.user.role === "Resident") {
    throw new ApiError(400, "Resident must be assigned to a flat before raising complaints.");
  }

  const attachments = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const uploadResult = await uploadOnCloudinary(file.path, "smart_society/complaints");
      if (uploadResult) {
        attachments.push({ url: uploadResult.url, public_id: uploadResult.public_id });
      }
    }
  } else if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path, "smart_society/complaints");
    if (uploadResult) {
      attachments.push({ url: uploadResult.url, public_id: uploadResult.public_id });
    }
  }

  let ticketNumber = generateTicketNumber();
  while (await Complaint.findOne({ ticketNumber })) {
    ticketNumber = generateTicketNumber();
  }

  // SLA Default: 24 hours for Emergency, 48 hours for High, 72 hours for Medium/Low
  const slaHours = priority === "Emergency" ? 24 : priority === "High" ? 48 : 72;
  const slaDueDate = new Date(Date.now() + slaHours * 60 * 60 * 1000);

  const complaint = await Complaint.create({
    ticketNumber,
    residentId: req.user._id,
    flatId: flatId || null,
    category,
    title,
    description,
    attachments,
    priority: priority || "Medium",
    status: "OPEN",
    slaDueDate,
  });

  return res.status(201).json(new ApiResponse(201, complaint, "Complaint ticket submitted successfully"));
});

// @desc    Get Complaints list (Admin sees all, Resident sees own, Staff sees assigned)
// @route   GET /api/v1/complaints
// @access  Private (Admin, Resident, Staff)
export const getComplaints = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === "Resident") {
    filter.residentId = req.user._id;
  } else if (req.user.role === "Staff") {
    filter.assignedStaffId = req.user._id;
  }

  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.priority) filter.priority = req.query.priority;

  const complaints = await Complaint.find(filter)
    .populate("residentId", "name email phone avatar")
    .populate("flatId")
    .populate("assignedStaffId", "name phone")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, complaints, "Complaints list retrieved successfully"));
});

// @desc    Assign Maintenance Staff to Ticket (Admin Routing)
// @route   POST /api/v1/complaints/:id/assign
// @access  Private (Admin)
export const assignStaffToComplaint = asyncHandler(async (req, res) => {
  const { staffId } = req.body;

  if (!staffId) {
    throw new ApiError(400, "Please provide staffId.");
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new ApiError(404, "Complaint ticket not found.");
  }

  const staff = await User.findById(staffId);
  if (!staff || staff.role !== "Staff") {
    throw new ApiError(400, "Assigned user must exist and have the 'Staff' role.");
  }

  complaint.assignedStaffId = staff._id;
  complaint.status = "IN_PROGRESS";
  await complaint.save();

  await logAudit({
    action: "COMPLAINT_ASSIGNED",
    performedBy: req.user._id,
    targetEntity: "Complaint",
    targetId: complaint._id,
    details: { ticketNumber: complaint.ticketNumber, assignedTo: staff.name },
    req,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, complaint, `Ticket routed and assigned to ${staff.name}`));
});

// @desc    Update Ticket Status & Resolution Notes (Staff, Admin)
// @route   PUT /api/v1/complaints/:id/status
// @access  Private (Staff, Admin)
export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status, resolutionNotes } = req.body;

  if (!status || !["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status)) {
    throw new ApiError(400, "Please provide a valid ticket status.");
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new ApiError(404, "Complaint ticket not found.");
  }

  const previousStatus = complaint.status;
  complaint.status = status;
  if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
  if (status === "RESOLVED" || status === "CLOSED") {
    complaint.resolvedAt = new Date();
  }

  await complaint.save();

  await logAudit({
    action: "COMPLAINT_STATUS_CHANGED",
    performedBy: req.user._id,
    targetEntity: "Complaint",
    targetId: complaint._id,
    details: { ticketNumber: complaint.ticketNumber, from: previousStatus, to: status },
    req,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, complaint, `Complaint status updated to ${status}`));
});
