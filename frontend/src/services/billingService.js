import axiosClient from "./axiosClient";

export const getBills = async (params) => {
  const res = await axiosClient.get("/bills", { params });
  return res.data;
};

export const getCollectionReport = async () => {
  const res = await axiosClient.get("/bills/reports/collection");
  return res.data;
};

export const generateMonthlyBills = async (payload) => {
  const res = await axiosClient.post("/bills/generate-monthly", payload);
  return res.data;
};

export const applyOverduePenalties = async (payload) => {
  const res = await axiosClient.post("/bills/apply-penalties", payload);
  return res.data;
};

export const payBill = async (id, payload = {}) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  const res = await axiosClient.post(`/bills/${id}/pay`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
