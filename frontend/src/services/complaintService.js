import axiosClient from "./axiosClient";

const toFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  return formData;
};

/** List complaints — backend already scopes by role (Resident: own, Staff: assigned, Admin: all). */
export const getComplaints = async (params) => {
  const res = await axiosClient.get("/complaints", { params });
  return res.data;
};

export const createComplaint = async (payload) => {
  const res = await axiosClient.post("/complaints", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const assignComplaint = async (id, staffId) => {
  const res = await axiosClient.post(`/complaints/${id}/assign`, { staffId });
  return res.data;
};

export const updateComplaintStatus = async (id, payload) => {
  const res = await axiosClient.put(`/complaints/${id}/status`, payload);
  return res.data;
};
