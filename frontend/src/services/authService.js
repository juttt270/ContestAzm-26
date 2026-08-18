import axiosClient from "./axiosClient";

const toFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, Array.isArray(value) ? JSON.stringify(value) : value);
  });
  return formData;
};

/** Login — returns { user, accessToken, refreshToken }. */
export const login = async (email, password) => {
  const res = await axiosClient.post("/auth/login", { email, password });
  return res.data;
};

/** Admin-only — creates a Resident/Guard/Staff/Admin account with a chosen role and flat. */
export const register = async (payload) => {
  const res = await axiosClient.post("/auth/register", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/** Public self-signup — always creates a Resident account, no flat assigned yet. */
export const signup = async ({ name, email, password, phone }) => {
  const res = await axiosClient.post("/auth/signup", { name, email, password, phone });
  return res.data;
};

/** Current logged-in user's profile. */
export const getMyProfile = async () => {
  const res = await axiosClient.get("/auth/me");
  return res.data;
};

/** Update profile (name, phone, vehicles, emergencyContacts, avatar). */
export const updateProfile = async (payload) => {
  const res = await axiosClient.put("/auth/update-profile", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const logout = async () => {
  await axiosClient.post("/auth/logout");
};

/** Change own password — requires the current password. */
export const changePassword = async (currentPassword, newPassword) => {
  const res = await axiosClient.put("/auth/change-password", { currentPassword, newPassword });
  return res.data;
};
