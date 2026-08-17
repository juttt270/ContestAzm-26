import axiosClient from "./axiosClient";

export const getFlats = async (params) => {
  const res = await axiosClient.get("/flats", { params });
  return res.data;
};

export const getOccupancyMap = async () => {
  const res = await axiosClient.get("/flats/occupancy-map");
  return res.data;
};

export const createFlat = async (payload) => {
  const res = await axiosClient.post("/flats", payload);
  return res.data;
};

export const assignFlat = async (id, payload) => {
  const res = await axiosClient.post(`/flats/${id}/assign`, payload);
  return res.data;
};
