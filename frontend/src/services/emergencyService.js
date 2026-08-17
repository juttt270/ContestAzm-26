import axiosClient from "./axiosClient";

export const getActiveAlerts = async () => {
  const res = await axiosClient.get("/emergency/active");
  return res.data;
};

export const triggerAlert = async (payload) => {
  const res = await axiosClient.post("/emergency/trigger", payload);
  return res.data;
};

export const resolveAlert = async (id) => {
  const res = await axiosClient.put(`/emergency/${id}/resolve`);
  return res.data;
};

export const getEmergencyContacts = async () => {
  const res = await axiosClient.get("/emergency/contacts");
  return res.data;
};

export const createEmergencyContact = async (payload) => {
  const res = await axiosClient.post("/emergency/contacts", payload);
  return res.data;
};

export const deleteEmergencyContact = async (id) => {
  const res = await axiosClient.delete(`/emergency/contacts/${id}`);
  return res.data;
};
