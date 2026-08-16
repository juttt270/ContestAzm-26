import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";

/**
 * Helper to generate tokens and attach refresh token cookie
 */
const generateTokensAndRespond = async (user, statusCode, message, res) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return res
    .status(statusCode)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        statusCode,
        {
          user: userObj,
          accessToken,
          refreshToken,
        },
        message
      )
    );
};

// @desc    Register a new user (Resident, Guard, Staff, Admin)
// @route   POST /api/v1/auth/register
// @access  Public (or Admin for staff)
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, flatId, occupancyStatus } = req.body;

  if (!name || !email || !password || !phone) {
    throw new ApiError(400, "Please provide name, email, password, and phone number.");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "User with this email address already exists.");
  }

  // Handle avatar upload if present
  let avatarData = { url: "", public_id: "" };
  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path, "smart_society/avatars");
    if (uploadResult) {
      avatarData = { url: uploadResult.url, public_id: uploadResult.public_id };
    }
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone,
    role: role || "Resident",
    flatId: flatId || null,
    occupancyStatus: occupancyStatus || "None",
    avatar: avatarData,
  });

  return generateTokensAndRespond(user, 201, "User registered successfully", res);
});

// @desc    Authenticate user & get tokens
// @route   POST /api/v1/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password.");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is deactivated. Contact society administration.");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password.");
  }

  return generateTokensAndRespond(user, 200, "Login successful", res);
});

// @desc    Refresh Access Token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is missing.");
  }

  const user = await User.findOne({ refreshToken: incomingRefreshToken });
  if (!user) {
    throw new ApiError(401, "Invalid or expired refresh token.");
  }

  return generateTokensAndRespond(user, 200, "Access token refreshed successfully", res);
});

// @desc    Logout user & clear tokens
// @route   POST /api/v1/auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

  const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production" };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// @desc    Get Current User Profile
// @route   GET /api/v1/auth/me
// @access  Private
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("flatId");
  return res.status(200).json(new ApiResponse(200, user, "Profile details retrieved"));
});

// @desc    Update Profile Details
// @route   PUT /api/v1/auth/update-profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, vehicles, emergencyContacts } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (vehicles) user.vehicles = vehicles;
  if (emergencyContacts) user.emergencyContacts = emergencyContacts;

  // Handle avatar update
  if (req.file) {
    if (user.avatar?.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
    }
    const uploadResult = await uploadOnCloudinary(req.file.path, "smart_society/avatars");
    if (uploadResult) {
      user.avatar = { url: uploadResult.url, public_id: uploadResult.public_id };
    }
  }

  await user.save();

  return res.status(200).json(new ApiResponse(200, user, "Profile updated successfully"));
});
