import { MaintenanceBill } from "../models/maintenanceBill.model.js";
import { Flat } from "../models/flat.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinaryUpload.js";
import { logAudit } from "../utils/auditLogger.js";
import { sendEmail } from "../utils/emailService.js";

const formatCurrency = (n) => `Rs ${Number(n || 0).toLocaleString("en-IN")}`;

/** Helper to generate bill number e.g. INV-202608-001 */
const generateBillNumber = (billingMonth, index) => {
  const cleanMonth = billingMonth.replace("-", "");
  const seq = (index + 1).toString().padStart(3, "0");
  return `INV-${cleanMonth}-${seq}`;
};

/** Splits amountDue proportionally so the breakdown always sums to the flat's actual maintenance rate. */
const defaultBreakdown = (amountDue) => ({
  waterCharges: Math.round(amountDue * 0.2),
  securityCharges: Math.round(amountDue * 0.32),
  repairCharges: Math.round(amountDue * 0.16),
  commonAreaCharges: Math.round(amountDue * 0.32),
});

// @desc    Public flat-dues lookup for the marketing homepage — no resident personal info returned.
// @route   GET /api/v1/bills/check?flat=B-402
// @access  Public
export const checkFlatDues = asyncHandler(async (req, res) => {
  const { flat } = req.query;
  if (!flat || !flat.trim()) {
    throw new ApiError(400, "Please provide a flat number, e.g. B-402.");
  }

  const cleaned = flat.trim().toUpperCase();
  const separatorIndex = cleaned.search(/[-\s]/);
  if (separatorIndex === -1) {
    return res.status(200).json(new ApiResponse(200, { found: false }, "Flat not found."));
  }

  const blockName = cleaned.slice(0, separatorIndex);
  const flatNumber = cleaned.slice(separatorIndex + 1).trim();

  const flatDoc = await Flat.findOne({ blockName, flatNumber });
  if (!flatDoc) {
    return res.status(200).json(new ApiResponse(200, { found: false }, "Flat not found."));
  }

  const latestBill = await MaintenanceBill.findOne({ flatId: flatDoc._id }).sort({ createdAt: -1 });
  if (!latestBill) {
    return res
      .status(200)
      .json(new ApiResponse(200, { found: true, hasBills: false, flat: `${blockName}-${flatNumber}` }, "No bills yet for this flat."));
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        found: true,
        hasBills: true,
        flat: `${blockName}-${flatNumber}`,
        billingMonth: latestBill.billingMonth,
        breakdown: latestBill.breakdown,
        penaltyAmount: latestBill.penaltyAmount,
        amountDue: latestBill.amountDue,
        totalDue: latestBill.amountDue + (latestBill.penaltyAmount || 0),
        dueDate: latestBill.dueDate,
        paymentStatus: latestBill.paymentStatus,
      },
      "Dues retrieved successfully"
    )
  );
});

// @desc    Generate Monthly Maintenance Bills for all occupied flats (Admin)
// @route   POST /api/v1/bills/generate-monthly
// @access  Private (Admin)
export const generateMonthlyBills = asyncHandler(async (req, res) => {
  const { billingMonth, dueDate, breakdown } = req.body;

  if (!billingMonth || !dueDate) {
    throw new ApiError(400, "Please provide billingMonth (e.g., '2026-08') and dueDate.");
  }

  const occupiedFlats = await Flat.find({ occupancyType: { $ne: "Vacant" } });
  if (occupiedFlats.length === 0) {
    throw new ApiError(400, "No occupied flats found to generate invoices.");
  }

  const generatedBills = [];

  for (let i = 0; i < occupiedFlats.length; i++) {
    const flat = occupiedFlats[i];
    const residentId = flat.tenantId || flat.ownerId;

    if (!residentId) continue;

    const existing = await MaintenanceBill.findOne({ flatId: flat._id, billingMonth });
    if (existing) continue; // Skip if already generated for this flat & month

    const billNumber = generateBillNumber(billingMonth, i);
    const amountDue = flat.maintenanceRate || 2500;

    const bill = await MaintenanceBill.create({
      billNumber,
      flatId: flat._id,
      residentId,
      billingMonth,
      amountDue,
      breakdown: breakdown || defaultBreakdown(amountDue),
      dueDate: new Date(dueDate),
      paymentStatus: "PENDING",
    });

    generatedBills.push(bill);

    const resident = await User.findById(residentId).select("email name");
    await sendEmail({
      to: resident?.email,
      subject: `New Maintenance Bill — ${bill.billNumber} (${billingMonth})`,
      title: "New Maintenance Bill Generated",
      bodyHtml: `
        <p>Hi ${resident?.name || "Resident"},</p>
        <p>Your maintenance bill for <b>${billingMonth}</b> has been generated.</p>
        <p><b>Bill Number:</b> ${bill.billNumber}<br/>
           <b>Amount Due:</b> ${formatCurrency(bill.amountDue)}<br/>
           <b>Due Date:</b> ${new Date(dueDate).toLocaleDateString()}</p>
        <p>Please log in to SmartSociety to pay your dues.</p>
      `,
    });
  }

  await logAudit({
    action: "BILLS_GENERATED",
    performedBy: req.user._id,
    targetEntity: "MaintenanceBill",
    targetId: null,
    details: { billingMonth, generatedCount: generatedBills.length },
    req,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { generatedCount: generatedBills.length, bills: generatedBills },
        "Monthly maintenance invoices generated successfully"
      )
    );
});

// @desc    Apply Overdue Penalties to Unpaid Invoices Past Due Date (Admin)
// @route   POST /api/v1/bills/apply-penalties
// @access  Private (Admin)
export const applyOverduePenalties = asyncHandler(async (req, res) => {
  const { penaltyPercentage = 5 } = req.body;
  const now = new Date();

  const overdueBills = await MaintenanceBill.find({
    paymentStatus: "PENDING",
    dueDate: { $lt: now },
  });

  let updatedCount = 0;
  for (const bill of overdueBills) {
    bill.paymentStatus = "OVERDUE";
    bill.penaltyAmount = Math.round((bill.amountDue * penaltyPercentage) / 100);
    await bill.save();
    updatedCount++;

    const resident = await User.findById(bill.residentId).select("email name");
    await sendEmail({
      to: resident?.email,
      subject: `Overdue Notice — Bill ${bill.billNumber}`,
      title: "Maintenance Bill Overdue",
      bodyHtml: `
        <p>Hi ${resident?.name || "Resident"},</p>
        <p>Your bill <b>${bill.billNumber}</b> is now overdue. A penalty of <b>${formatCurrency(bill.penaltyAmount)}</b> has been applied.</p>
        <p><b>Total Due:</b> ${formatCurrency(bill.amountDue + bill.penaltyAmount)}</p>
        <p>Please pay as soon as possible to avoid further penalties.</p>
      `,
    });
  }

  await logAudit({
    action: "PENALTIES_APPLIED",
    performedBy: req.user._id,
    targetEntity: "MaintenanceBill",
    targetId: null,
    details: { penaltyPercentage, updatedCount },
    req,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedCount },
        `Applied ${penaltyPercentage}% overdue penalty to ${updatedCount} bills.`
      )
    );
});

// @desc    Get Bills List (Admin sees all, Resident sees own)
// @route   GET /api/v1/bills
// @access  Private (Admin, Resident)
export const getBills = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === "Resident") {
    filter.residentId = req.user._id;
  } else if (req.query.flatId) {
    filter.flatId = req.query.flatId;
  }

  if (req.query.status) {
    filter.paymentStatus = req.query.status;
  }

  const bills = await MaintenanceBill.find(filter)
    .populate("flatId")
    .populate("residentId", "name email phone")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, bills, "Maintenance bills retrieved successfully"));
});

// @desc    Simulate Digital Payment & Generate PDF Receipt Metadata (Resident)
// @route   POST /api/v1/bills/:id/pay
// @access  Private (Resident)
export const payMaintenanceBill = asyncHandler(async (req, res) => {
  const { paymentMethod = "SIMULATED_CARD" } = req.body;

  const bill = await MaintenanceBill.findById(req.params.id).populate("flatId");
  if (!bill) {
    throw new ApiError(404, "Maintenance bill invoice not found.");
  }

  if (bill.paymentStatus === "PAID") {
    throw new ApiError(400, "Bill has already been paid.");
  }

  // Handle optional receipt image upload if uploaded
  let receiptData = { url: "", public_id: "" };
  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path, "smart_society/receipts");
    if (uploadResult) {
      receiptData = { url: uploadResult.url, public_id: uploadResult.public_id };
    }
  }

  bill.paymentStatus = "PAID";
  bill.paymentMethod = paymentMethod;
  bill.transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  bill.paidAt = new Date();
  if (receiptData.url) bill.paymentReceipt = receiptData;

  await bill.save();

  await logAudit({
    action: "BILL_PAID",
    performedBy: req.user._id,
    targetEntity: "MaintenanceBill",
    targetId: bill._id,
    details: { billNumber: bill.billNumber, amountPaid: bill.amountDue + bill.penaltyAmount, paymentMethod },
    req,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        bill,
        receiptMetadata: {
          receiptNo: `RCP-${bill.billNumber}`,
          totalPaid: bill.amountDue + bill.penaltyAmount,
          transactionId: bill.transactionId,
          paidAt: bill.paidAt,
        },
      },
      "Payment processed successfully! Digital PDF receipt available for download."
    )
  );
});

// @desc    Get Financial Collection Report (Admin)
// @route   GET /api/v1/bills/reports/collection
// @access  Private (Admin)
export const getCollectionReport = asyncHandler(async (req, res) => {
  const totalInvoiced = await MaintenanceBill.aggregate([
    { $group: { _id: null, total: { $sum: "$amountDue" } } },
  ]);

  const totalCollected = await MaintenanceBill.aggregate([
    { $match: { paymentStatus: "PAID" } },
    { $group: { _id: null, total: { $sum: { $add: ["$amountDue", "$penaltyAmount"] } } } },
  ]);

  const pendingDues = await MaintenanceBill.aggregate([
    { $match: { paymentStatus: { $in: ["PENDING", "OVERDUE"] } } },
    { $group: { _id: null, total: { $sum: { $add: ["$amountDue", "$penaltyAmount"] } } } },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalInvoiced: totalInvoiced[0]?.total || 0,
        totalCollected: totalCollected[0]?.total || 0,
        pendingDues: pendingDues[0]?.total || 0,
      },
      "Financial collection analytics summary generated"
    )
  );
});
