import axiosClient from "./axiosClient";

const toFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  return formData;
};

export const getNotices = async (params) => {
  const res = await axiosClient.get("/notices", { params });
  return res.data;
};

export const createNotice = async (payload) => {
  const res = await axiosClient.post("/notices", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const voteOnPoll = async (id, optionId) => {
  const res = await axiosClient.post(`/notices/${id}/vote`, { optionId });
  return res.data;
};
