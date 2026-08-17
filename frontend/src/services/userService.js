import axiosClient from "./axiosClient";

/** List users — Admin only. Supports role/isActive/search filters. */
export const getUsers = async (params) => {
  const res = await axiosClient.get("/users", { params });
  return res.data;
};

export const getUserById = async (id) => {
  const res = await axiosClient.get(`/users/${id}`);
  return res.data;
};

export const updateUserStatus = async (id, payload) => {
  const res = await axiosClient.put(`/users/${id}/status`, payload);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axiosClient.delete(`/users/${id}`);
  return res.data;
};

/** Admin override — set a new password for any user without needing their old one. */
export const resetPassword = async (id, newPassword) => {
  const res = await axiosClient.put(`/users/${id}/reset-password`, { newPassword });
  return res.data;
};

/** Gate security: look up which resident a vehicle number belongs to. */
export const lookupVehicle = async (vehicleNumber) => {
  const res = await axiosClient.get("/users/vehicles/lookup", { params: { vehicleNumber } });
  return res.data;
};
