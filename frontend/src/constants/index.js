export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  COMPLAINTS: "/complaints",
  USERS: "/users",
  FLATS: "/flats",
  VISITORS: "/visitors",
  BILLING: "/billing",
  NOTICES: "/notices",
  AMENITIES: "/amenities",
  EMERGENCY: "/emergency",
  GUIDELINES: "/guidelines",
  AUDIT_LOGS: "/audit-logs",
  PROFILE: "/profile",
  SITEMAP: "/sitemap",
  NOT_FOUND: "*",
};

export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
};

/** Display-only labels — the underlying `role` value ("Staff") stays unchanged everywhere else. */
export const ROLE_LABELS = {
  Admin: "Admin",
  Resident: "Resident",
  Guard: "Guard",
  Staff: "Maintenance Staff",
};
