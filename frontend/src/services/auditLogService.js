import axiosClient from "./axiosClient";

export const getAuditLogs = async (params) => {
  const res = await axiosClient.get("/audit-logs", { params });
  return res.data;
};
