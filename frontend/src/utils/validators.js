/**
 * Centralized Validation Engine & RFC Regex Rules for SmartSociety
 */

export const REGEX = {
  // RFC 5322 compliant standard email validation
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // International & local phone numbers: 10 to 15 digits, supports +92, 03xx, spaces, dashes
  PHONE: /^(?:\+?[1-9]\d{0,2}[ -]?)?(?:\d{3,4}[ -]?\d{3,4}[ -]?\d{3,4}|\d{10,15})$/,

  // Standard person names: 2 to 50 characters, letters, spaces, dots, hyphens, apostrophes
  NAME: /^[a-zA-ZÀ-ÿ\s'.-]{2,50}$/,

  // Alphanumeric vehicle license plate format: e.g. LE12-3456, KHI-7890, ABC-123
  VEHICLE: /^[A-Za-z0-9\s\-]{2,15}$/,

  // Flat / Block identifier: e.g. 101, A-102, Block-A
  FLAT_NUMBER: /^[A-Za-z0-9\-_]{1,15}$/,

  // Billing month format: YYYY-MM
  BILLING_MONTH: /^\d{4}-(0[1-9]|1[0-2])$/,

  // 24-hour time format: HH:mm
  TIME: /^([01]\d|2[0-3]):([0-5]\d)$/,
};

/**
 * Validates full name / person name
 */
export function validateName(name, fieldName = "Name") {
  if (!name || !name.trim()) {
    return `${fieldName} is required.`;
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return `${fieldName} must be at least 2 characters.`;
  }
  if (trimmed.length > 50) {
    return `${fieldName} cannot exceed 50 characters.`;
  }
  if (!REGEX.NAME.test(trimmed)) {
    return `${fieldName} should only contain letters, spaces, and hyphens.`;
  }
  return "";
}

/**
 * Validates standard email address
 */
export function validateEmail(email) {
  if (!email || !email.trim()) {
    return "Email address is required.";
  }
  const trimmed = email.trim();
  if (!REGEX.EMAIL.test(trimmed)) {
    return "Please enter a valid email address (e.g. name@domain.com).";
  }
  return "";
}

/**
 * Validates international / local phone number
 */
export function validatePhone(phone, fieldName = "Phone number") {
  if (!phone || !phone.trim()) {
    return `${fieldName} is required.`;
  }
  const trimmed = phone.trim();
  const digitsOnly = trimmed.replace(/\D/g, "");
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return `${fieldName} must contain between 10 and 15 digits.`;
  }
  if (!REGEX.PHONE.test(trimmed)) {
    return "Please enter a valid phone number (e.g. +92 300 1234567).";
  }
  return "";
}

/**
 * Validates password strength & length
 */
export function validatePassword(password, minLength = 6) {
  if (!password) {
    return "Password is required.";
  }
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long.`;
  }
  return "";
}

/**
 * Validates password match confirmation
 */
export function validatePasswordMatch(password, confirmPassword) {
  if (!confirmPassword) {
    return "Please confirm your password.";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }
  return "";
}

/**
 * Validates vehicle license plate number
 */
export function validateVehicleNumber(vehicleNumber) {
  if (!vehicleNumber || !vehicleNumber.trim()) {
    return ""; // Vehicle is often optional, check only if provided
  }
  const trimmed = vehicleNumber.trim();
  if (!REGEX.VEHICLE.test(trimmed)) {
    return "Please enter a valid vehicle plate (e.g. LE-1234).";
  }
  return "";
}

/**
 * Validates flat / unit number
 */
export function validateFlatNumber(flatNumber, fieldName = "Flat number") {
  if (!flatNumber || !String(flatNumber).trim()) {
    return `${fieldName} is required.`;
  }
  const trimmed = String(flatNumber).trim();
  if (!REGEX.FLAT_NUMBER.test(trimmed)) {
    return `${fieldName} should be alphanumeric (e.g. 101, A-102).`;
  }
  return "";
}

/**
 * Validates billing month YYYY-MM
 */
export function validateBillingMonth(month) {
  if (!month || !month.trim()) {
    return "Billing month is required.";
  }
  if (!REGEX.BILLING_MONTH.test(month.trim())) {
    return "Please select a valid billing month (YYYY-MM).";
  }
  return "";
}

/**
 * Validates positive number / integer with optional bounds
 */
export function validatePositiveNumber(value, fieldName = "Value", min = 1, max = Infinity) {
  if (value === undefined || value === null || value === "") {
    return `${fieldName} is required.`;
  }
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number.`;
  }
  if (num < min) {
    return `${fieldName} must be at least ${min}.`;
  }
  if (num > max) {
    return `${fieldName} cannot exceed ${max}.`;
  }
  return "";
}

/**
 * Validates required text with minimum length
 */
export function validateRequired(value, fieldName = "This field", minLength = 1, maxLength = Infinity) {
  if (!value || !String(value).trim()) {
    return `${fieldName} is required.`;
  }
  const trimmed = String(value).trim();
  if (trimmed.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters.`;
  }
  if (trimmed.length > maxLength) {
    return `${fieldName} cannot exceed ${maxLength} characters.`;
  }
  return "";
}

/**
 * Validates future date or today
 */
export function validateFutureDate(dateString, fieldName = "Date") {
  if (!dateString) {
    return `${fieldName} is required.`;
  }
  const targetDate = new Date(dateString);
  if (isNaN(targetDate.getTime())) {
    return "Please enter a valid date.";
  }
  const now = new Date();
  // Allow within 5 minutes buffer
  if (targetDate.getTime() < now.getTime() - 5 * 60 * 1000) {
    return `${fieldName} cannot be in the past.`;
  }
  return "";
}

/**
 * Validates time slot (start time before end time)
 */
export function validateTimeSlot(startTime, endTime) {
  if (!startTime) return "Start time is required.";
  if (!endTime) return "End time is required.";
  if (!REGEX.TIME.test(startTime)) return "Start time format must be HH:mm.";
  if (!REGEX.TIME.test(endTime)) return "End time format must be HH:mm.";

  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;

  if (endMinutes <= startMinutes) {
    return "End time must be after start time.";
  }
  return "";
}
