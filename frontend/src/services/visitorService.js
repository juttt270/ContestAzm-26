import axiosClient from "./axiosClient";

export const getVisitors = async (params) => {
  const res = await axiosClient.get("/visitors", { params });
  return res.data;
};

export const getOverstayAlerts = async () => {
  const res = await axiosClient.get("/visitors/overstay-alerts");
  return res.data;
};

export const generateVisitorPass = async (payload) => {
  const res = await axiosClient.post("/visitors/generate-pass", payload);
  return res.data;
};

export const verifyQrPass = async (payload) => {
  const res = await axiosClient.post("/visitors/verify-qr", payload);
  return res.data;
};

export const logWalkIn = async (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  const res = await axiosClient.post("/visitors/walk-in", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const checkoutVisitor = async (id) => {
  const res = await axiosClient.post(`/visitors/${id}/checkout`);
  return res.data;
};
