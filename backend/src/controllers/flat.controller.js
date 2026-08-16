import { Flat } from "../models/flat.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Create a new flat/unit
// @route   POST /api/v1/flats
// @access  Private (Admin)
export const createFlat = asyncHandler(async (req, res) => {
  const { blockName, flatNumber, floor, maintenanceRate } = req.body;

  if (!blockName || !flatNumber || floor === undefined) {
    throw new ApiError(400, "Please provide blockName, flatNumber, and floor.");
  }

  const existingFlat = await Flat.findOne({
    blockName: blockName.toUpperCase(),
    flatNumber: flatNumber.toUpperCase(),
  });

  if (existingFlat) {
    throw new ApiError(409, `Flat ${flatNumber} in Block ${blockName} already exists.`);
  }

  const flat = await Flat.create({
    blockName: blockName.toUpperCase(),
    flatNumber: flatNumber.toUpperCase(),
    floor,
    maintenanceRate: maintenanceRate || 2500,
  });

  return res.status(201).json(new ApiResponse(201, flat, "Flat created successfully"));
});

// @desc    Get all flats (with filter and pagination)
// @route   GET /api/v1/flats
// @access  Private (Admin, Resident, Guard)
export const getAllFlats = asyncHandler(async (req, res) => {
  const { blockName, occupancyType } = req.query;
  const filter = {};

  if (blockName) filter.blockName = blockName.toUpperCase();
  if (occupancyType) filter.occupancyType = occupancyType;

  const flats = await Flat.find(filter)
    .populate("ownerId", "name email phone avatar")
    .populate("tenantId", "name email phone avatar")
    .sort({ blockName: 1, flatNumber: 1 });

  return res.status(200).json(new ApiResponse(200, flats, "Flats list retrieved successfully"));
});

// @desc    Assign Owner or Tenant to a Flat
// @route   POST /api/v1/flats/:id/assign
// @access  Private (Admin)
export const assignResidentToFlat = asyncHandler(async (req, res) => {
  const { userId, occupancyType } = req.body;

  if (!userId || !["Owner", "Tenant"].includes(occupancyType)) {
    throw new ApiError(400, "Please provide valid userId and occupancyType ('Owner' or 'Tenant').");
  }

  const flat = await Flat.findById(req.params.id);
  if (!flat) {
    throw new ApiError(404, "Flat not found.");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "Resident user not found.");
  }

  if (occupancyType === "Owner") {
    flat.ownerId = user._id;
    flat.occupancyType = "Owner";
  } else if (occupancyType === "Tenant") {
    flat.tenantId = user._id;
    flat.occupancyType = "Tenant";
  }

  await flat.save();

  // Link flat back to user document
  user.flatId = flat._id;
  user.occupancyStatus = occupancyType;
  await user.save({ validateBeforeSave: false });

  const updatedFlat = await Flat.findById(flat._id)
    .populate("ownerId", "name email phone")
    .populate("tenantId", "name email phone");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedFlat, `Resident assigned as ${occupancyType} successfully`));
});

// @desc    Get Society Occupancy Map & Stats
// @route   GET /api/v1/flats/occupancy-map
// @access  Private (Admin)
export const getOccupancyMap = asyncHandler(async (req, res) => {
  const totalFlats = await Flat.countDocuments();
  const ownerOccupied = await Flat.countDocuments({ occupancyType: "Owner" });
  const tenantOccupied = await Flat.countDocuments({ occupancyType: "Tenant" });
  const vacant = await Flat.countDocuments({ occupancyType: "Vacant" });

  const flatsByBlock = await Flat.aggregate([
    {
      $group: {
        _id: "$blockName",
        total: { $sum: 1 },
        occupied: {
          $sum: { $cond: [{ $ne: ["$occupancyType", "Vacant"] }, 1, 0] },
        },
        vacant: {
          $sum: { $cond: [{ $eq: ["$occupancyType", "Vacant"] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalFlats,
        ownerOccupied,
        tenantOccupied,
        vacant,
        flatsByBlock,
      },
      "Occupancy map summary generated"
    )
  );
});
