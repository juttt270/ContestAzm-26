import QRCode from "qrcode";
import crypto from "crypto";
import { Visitor } from "../models/visitor.model.js";
import { GateLog } from "../models/gateLog.model.js";
import { Flat } from "../models/flat.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinaryUpload.js";
import { sendBulkEmail } from "../utils/emailService.js";

/** Helper to generate random 6-digit numeric pass code */
const generatePassCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/** Helper to generate secure random token for QR payload */
const generateQrToken = () => {
  return `VQR-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
};

// @desc    Generate Pre-approved Digital QR Visitor Pass (Resident & Admin)
// @route   POST /api/v1/visitors/generate-pass
// @access  Private (Resident, Admin)
export const generateVisitorPass = asyncHandler(async (req, res) => {
  const { visitorName, phone, vehicleNumber, visitorType, purpose, validFrom, validUntil, targetFlatId } = req.body;

  if (!visitorName || !phone || !validUntil) {
    throw new ApiError(400, "Please provide visitorName, phone, and validUntil timestamp.");
  }

  // Use resident's flat if not specified
  const flatId = targetFlatId || req.user.flatId;
  if (!flatId) {
    throw new ApiError(400, "Target flat is required. Resident must be assigned to a flat.");
  }

  // Photo is entirely optional — the pass still generates fine without one.
  let photoData = { url: "", public_id: "" };
  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path, "smart_society/visitors");
    if (uploadResult) {
      photoData = { url: uploadResult.url, public_id: uploadResult.public_id };
    }
  }

  let passCode = generatePassCode();
  while (await Visitor.findOne({ passCode })) {
    passCode = generatePassCode();
  }

  let qrToken = generateQrToken();
  while (await Visitor.findOne({ qrToken })) {
    qrToken = generateQrToken();
  }

  const validFromDate = validFrom ? new Date(validFrom) : new Date();
  const validUntilDate = new Date(validUntil);

  // Encode just the short qrToken (not the full visitor payload) — a shorter
  // string means fewer QR modules, so the printed code is easier for a camera
  // to resolve at a distance instead of needing a dense, packed-in scan.
  const qrCodeDataUrl = await QRCode.toDataURL(qrToken, {
    errorCorrectionLevel: "M",
    margin: 4,
    color: {
      dark: "#0F172A",
      light: "#FFFFFF",
    },
  });

  const visitor = await Visitor.create({
    passCode,
    qrToken,
    qrCodeDataUrl,
    residentId: req.user._id,
    targetFlatId: flatId,
    visitorName,
    phone,
    vehicleNumber: vehicleNumber || "N/A",
    purpose: purpose || "Personal Visit",
    visitorType: visitorType || "Guest",
    photo: photoData,
    validFrom: validFromDate,
    validUntil: validUntilDate,
    status: "APPROVED",
  });

  const populatedVisitor = await Visitor.findById(visitor._id)
    .populate("targetFlatId")
    .populate("residentId", "name phone email");

  return res
    .status(201)
    .json(new ApiResponse(201, populatedVisitor, "Digital QR Visitor Pass generated successfully"));
});

// @desc    Verify QR Code / Scan Verification (Security Guard & Admin)
// @route   POST /api/v1/visitors/verify-qr
// @access  Private (Guard, Admin)
export const verifyQrCodePass = asyncHandler(async (req, res) => {
  const { qrToken, passCode, notes, intent } = req.body;

  if (!qrToken && !passCode) {
    throw new ApiError(400, "Please provide qrToken or passCode from the scanned QR code.");
  }

  // Lookup visitor pass by qrToken or passCode
  const query = qrToken ? { qrToken } : { passCode };
  const visitor = await Visitor.findOne(query)
    .populate("targetFlatId")
    .populate("residentId", "name phone");

  if (!visitor) {
    throw new ApiError(404, "Invalid, unknown, or corrupted QR code visitor pass.");
  }

  const now = new Date();

  // Dedicated exit-scan flow: the guard explicitly opened the Checkout scanner,
  // so only allow it to complete a checkout — never silently check someone in.
  if (intent === "CHECK_OUT") {
    if (visitor.status !== "CHECKED_IN" && visitor.status !== "Checked-In") {
      const reason =
        visitor.status === "COMPLETED" || visitor.status === "Checked-Out"
          ? "This visitor has already checked out."
          : visitor.status === "CANCELLED"
            ? "This pass was cancelled — the visitor never checked in."
            : "This visitor hasn't checked in yet, so there's nothing to check out.";
      throw new ApiError(400, reason);
    }

    visitor.status = "COMPLETED";
    visitor.checkedOutAt = now;
    await visitor.save();

    await GateLog.create({
      visitorId: visitor._id,
      flatId: visitor.targetFlatId._id,
      guardId: req.user._id,
      action: "CHECK_OUT",
      notes: notes || `Verified QR code payload (Token: ${visitor.qrToken}) at security gate terminal on exit`,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          clearanceGranted: true,
          action: "CHECK_OUT",
          visitor: {
            id: visitor._id,
            visitorName: visitor.visitorName,
            phone: visitor.phone,
            vehicleNumber: visitor.vehicleNumber,
            targetFlat: visitor.targetFlatId,
            resident: visitor.residentId,
            checkedOutAt: visitor.checkedOutAt,
            status: visitor.status,
          },
        },
        "EXIT LOGGED: Visitor checked out successfully."
      )
    );
  }

  // Expiry check
  if (visitor.status === "EXPIRED" || now > visitor.validUntil) {
    visitor.status = "EXPIRED";
    await visitor.save();
    throw new ApiError(400, `QR pass has EXPIRED. Expiry time was ${visitor.validUntil.toLocaleString()}`);
  }

  if (visitor.status === "CANCELLED") {
    throw new ApiError(400, "QR pass was CANCELLED by the resident.");
  }

  if (visitor.status === "CHECKED_IN" || visitor.status === "Checked-In") {
    throw new ApiError(400, `Visitor is ALREADY checked in at ${visitor.checkedInAt?.toLocaleString() || "the gate"}. Use the Checkout scan to log their exit.`);
  }

  if (visitor.status === "COMPLETED" || visitor.status === "Checked-Out") {
    throw new ApiError(400, "This visitor has already checked out. The pass is no longer valid for entry.");
  }

  // Perform Gate Clearance and Check-In
  visitor.status = "CHECKED_IN";
  visitor.checkedInAt = now;
  await visitor.save();

  // Create immutable Audit Record in GateLog
  await GateLog.create({
    visitorId: visitor._id,
    flatId: visitor.targetFlatId._id,
    guardId: req.user._id,
    action: "CHECK_IN",
    notes: notes || `Verified QR code payload (Token: ${visitor.qrToken}) at security gate terminal`,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        clearanceGranted: true,
        action: "CHECK_IN",
        visitor: {
          id: visitor._id,
          visitorName: visitor.visitorName,
          phone: visitor.phone,
          vehicleNumber: visitor.vehicleNumber,
          targetFlat: visitor.targetFlatId,
          resident: visitor.residentId,
          checkedInAt: visitor.checkedInAt,
          status: visitor.status,
        },
      },
      "ACCESS GRANTED: Visitor QR verified successfully. Gate check-in recorded."
    )
  );
});

// @desc    Log Walk-in Visitor without Pre-approval (Guard Terminal)
// @route   POST /api/v1/visitors/walk-in
// @access  Private (Guard, Admin)
export const logWalkInVisitor = asyncHandler(async (req, res) => {
  const { visitorName, phone, vehicleNumber, visitorType, purpose, targetFlatId, notes } = req.body;

  if (!visitorName || !phone || !targetFlatId) {
    throw new ApiError(400, "Please provide visitorName, phone, and targetFlatId.");
  }

  const flat = await Flat.findById(targetFlatId);
  if (!flat) {
    throw new ApiError(404, "Target flat not found.");
  }

  // Handle photo capture upload if present
  let photoData = { url: "", public_id: "" };
  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path, "smart_society/visitors");
    if (uploadResult) {
      photoData = { url: uploadResult.url, public_id: uploadResult.public_id };
    }
  }

  let passCode = generatePassCode();
  while (await Visitor.findOne({ passCode })) {
    passCode = generatePassCode();
  }

  let qrToken = generateQrToken();
  while (await Visitor.findOne({ qrToken })) {
    qrToken = generateQrToken();
  }

  const now = new Date();
  const validUntil = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours default stay window

  // Encode just the short qrToken — see the same fix in generateVisitorPass above.
  const qrCodeDataUrl = await QRCode.toDataURL(qrToken, { errorCorrectionLevel: "M", margin: 4 });

  const visitor = await Visitor.create({
    passCode,
    qrToken,
    qrCodeDataUrl,
    residentId: flat.ownerId || flat.tenantId || req.user._id,
    targetFlatId: flat._id,
    visitorName,
    phone,
    vehicleNumber: vehicleNumber || "N/A",
    purpose: purpose || "Walk-in Entry",
    visitorType: visitorType || "Vendor",
    photo: photoData,
    validFrom: now,
    validUntil,
    status: "CHECKED_IN",
    checkedInAt: now,
  });

  await GateLog.create({
    visitorId: visitor._id,
    flatId: flat._id,
    guardId: req.user._id,
    action: "CHECK_IN",
    notes: notes || "Walk-in visitor logged and checked in at gate terminal",
  });

  return res.status(201).json(new ApiResponse(201, visitor, "Walk-in visitor logged and checked in successfully"));
});

// @desc    Cancel a pre-approved visitor pass before it's used at the gate
// @route   PUT /api/v1/visitors/:id/cancel
// @access  Private (Resident who issued it, or Admin)
export const cancelVisitorPass = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.id);
  if (!visitor) {
    throw new ApiError(404, "Visitor pass not found.");
  }

  const isOwner = visitor.residentId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "Admin") {
    throw new ApiError(403, "You can only cancel a pass you issued yourself.");
  }

  if (visitor.status !== "APPROVED") {
    throw new ApiError(400, `Cannot cancel a pass that is already ${visitor.status.replace(/_/g, " ").toLowerCase()}.`);
  }

  visitor.status = "CANCELLED";
  await visitor.save();

  return res.status(200).json(new ApiResponse(200, visitor, "Visitor pass cancelled successfully"));
});

// @desc    Record Visitor Exit / Checkout (Guard Terminal)
// @route   POST /api/v1/visitors/:id/checkout
// @access  Private (Guard, Admin)
export const checkoutVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.id);
  if (!visitor) {
    throw new ApiError(404, "Visitor entry record not found.");
  }

  if (visitor.status === "COMPLETED" || visitor.status === "Checked-Out") {
    throw new ApiError(400, "Visitor has already checked out.");
  }

  const now = new Date();
  visitor.status = "COMPLETED";
  visitor.checkedOutAt = now;
  await visitor.save();

  await GateLog.create({
    visitorId: visitor._id,
    flatId: visitor.targetFlatId,
    guardId: req.user._id,
    action: "CHECK_OUT",
    notes: "Visitor checkout recorded at gate terminal",
  });

  return res.status(200).json(new ApiResponse(200, visitor, "Visitor checkout recorded successfully"));
});

// @desc    Get Overstay & Unapproved Visitor Alerts (Guard & Admin)
// @route   GET /api/v1/visitors/overstay-alerts
// @access  Private (Guard, Admin)
export const getOverstayAlerts = asyncHandler(async (req, res) => {
  const now = new Date();
  const overstayVisitors = await Visitor.find({
    status: { $in: ["CHECKED_IN", "Checked-In"] },
    validUntil: { $lt: now },
  })
    .populate("targetFlatId")
    .populate("residentId", "name phone");

  // Notify Guards & Admins once per visitor the first time an overstay is detected.
  const freshOverstays = overstayVisitors.filter((v) => !v.overstayNotified);
  if (freshOverstays.length > 0) {
    const notifyTargets = await User.find({ role: { $in: ["Guard", "Admin"] }, isActive: true }).select("email");
    await sendBulkEmail({
      recipients: notifyTargets.map((u) => u.email),
      subject: `⚠ Visitor Overstay Alert — ${freshOverstays.length} visitor(s)`,
      title: "Visitor Overstay Alert",
      bodyHtml: `
        <p>The following visitor pass(es) have exceeded their approved valid-until time and have not checked out:</p>
        <ul>
          ${freshOverstays
            .map(
              (v) =>
                `<li><b>${v.visitorName}</b> — Flat ${v.targetFlatId?.blockName || ""}-${v.targetFlatId?.flatNumber || ""}, was due out by ${new Date(v.validUntil).toLocaleString()}</li>`
            )
            .join("")}
        </ul>
        <p>Please follow up at the gate.</p>
      `,
    });
    await Visitor.updateMany({ _id: { $in: freshOverstays.map((v) => v._id) } }, { $set: { overstayNotified: true } });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, overstayVisitors, "Active overstay visitor alerts retrieved"));
});

// @desc    Get Visitor Logs (Filtered by resident/flat/status)
// @route   GET /api/v1/visitors
// @access  Private (Admin, Guard, Resident)
export const getVisitorLogs = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === "Resident") {
    filter.residentId = req.user._id;
  } else if (req.query.flatId) {
    filter.targetFlatId = req.query.flatId;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const visitors = await Visitor.find(filter)
    .populate("targetFlatId")
    .populate("residentId", "name phone");

  // Sort by whichever timestamp is actually shown in the table — checkout time
  // if they've left, else check-in time, else when the pass was created — so
  // the most recently checked-in/checked-out visitor always lands on top.
  const latestActivityAt = (v) => new Date(v.checkedOutAt || v.checkedInAt || v.createdAt).getTime();
  visitors.sort((a, b) => latestActivityAt(b) - latestActivityAt(a));

  return res.status(200).json(new ApiResponse(200, visitors, "Visitor logs retrieved successfully"));
});
