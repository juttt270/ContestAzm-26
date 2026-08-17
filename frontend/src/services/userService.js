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
