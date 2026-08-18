/**
 * Comprehensive Regex & Input Validation Suite
 * ContestAZM-2026 / SmartSociety Platform
 */

// Regular Expression Patterns
export const REGEX = {
  // RFC 5322 compliant Email Regex
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // Pakistani & International Phone formats (e.g., 03001234567, +923001234567, +12345678901)
  PHONE: /^(\+92|92|0)?3[0-9]{9}$|^\+?[1-9]\d{7,14}$/,

  // Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char (@$!%*?&)
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

  // Pakistani CNIC (13 digits, with or without hyphens: 35202-1234567-1 or 3520212345671)
  CNIC: /^\d{5}-?\d{7}-?\d{1}$/,

  // Vehicle Registration Number (e.g., LEC-1234, LEB-19-450, LEA 123)
  VEHICLE_NO: /^[A-Za-z]{1,4}[-\s]?\d{1,4}([-\s]?\d{1,2})?$/,

  // Name: 2-50 characters, letters, spaces, dots, hyphens
  NAME: /^[a-zA-Z\s.'-]{2,50}$/,
};

/**
 * Strips dangerous HTML tags and script injections from input strings.
 */
export function sanitizeInput(input) {
  if (typeof input !== "string") return input;
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "");
}

/**
 * Validates an email address.
 */
export function validateEmail(email) {
  if (!email || typeof email !== "string") return "Email address is required.";
  const clean = email.trim();
  if (!REGEX.EMAIL.test(clean)) {
    return "Please enter a valid email address (e.g. user@example.com).";
  }
  return "";
}

/**
 * Validates a phone number.
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== "string") return "Phone number is required.";
  const clean = phone.trim().replace(/\s+/g, "");
  if (!REGEX.PHONE.test(clean)) {
    return "Enter a valid phone number (e.g., 03001234567 or +923001234567).";
  }
  return "";
}

/**
 * Validates a password against strong security constraints.
 */
export function validatePassword(password) {
  if (!password || typeof password !== "string") return "Password is required.";
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!REGEX.PASSWORD.test(password)) {
    return "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&).";
  }
  return "";
}

/**
 * Validates a Pakistani CNIC number.
 */
export function validateCNIC(cnic) {
  if (!cnic || typeof cnic !== "string") return "CNIC is required.";
  const clean = cnic.trim();
  if (!REGEX.CNIC.test(clean)) {
    return "Enter a valid 13-digit CNIC (e.g., 35202-1234567-1).";
  }
  return "";
}

/**
 * Validates a full name or visitor name.
 */
export function validateName(name, fieldLabel = "Name") {
  if (!name || typeof name !== "string") return `${fieldLabel} is required.`;
  const clean = name.trim();
  if (clean.length < 2) return `${fieldLabel} must be at least 2 characters.`;
  if (clean.length > 50) return `${fieldLabel} cannot exceed 50 characters.`;
  if (!REGEX.NAME.test(clean)) {
    return `${fieldLabel} can only contain letters, spaces, hyphens, and dots.`;
  }
  return "";
}

/**
 * Validates vehicle registration number.
 */
export function validateVehicleNumber(vehicleNo) {
  if (!vehicleNo || typeof vehicleNo !== "string") return ""; // Optional in some forms
  const clean = vehicleNo.trim();
  if (clean && !REGEX.VEHICLE_NO.test(clean)) {
    return "Enter a valid vehicle number (e.g., LEC-1234).";
  }
  return "";
}

/**
 * Validates an entire form object using a field schema map.
 * Returns { isValid: boolean, errors: Object }
 */
export function validateForm(formData, schema) {
  const errors = {};
  let isValid = true;

  for (const [field, ruleFn] of Object.entries(schema)) {
    const value = formData[field];
    const errorMsg = ruleFn(value);
    if (errorMsg) {
      errors[field] = errorMsg;
      isValid = false;
    }
  }

  return { isValid, errors };
}
