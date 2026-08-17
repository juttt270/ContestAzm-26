import axiosClient from "./axiosClient";

export const getGuidelines = async () => {
  const res = await axiosClient.get("/guidelines");
  return res.data;
};

export const createGuideline = async (payload) => {
  const res = await axiosClient.post("/guidelines", payload);
  return res.data;
};

export const updateGuideline = async (id, payload) => {
  const res = await axiosClient.put(`/guidelines/${id}`, payload);
  return res.data;
};

export const deleteGuideline = async (id) => {
  const res = await axiosClient.delete(`/guidelines/${id}`);
  return res.data;
};
