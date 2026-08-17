import axiosClient from "./axiosClient";

export const getAmenities = async () => {
  const res = await axiosClient.get("/amenities");
  return res.data;
};

export const checkAvailability = async (id, bookingDate) => {
  const res = await axiosClient.get(`/amenities/${id}/availability`, { params: { bookingDate } });
  return res.data;
};

export const bookAmenity = async (id, payload) => {
  const res = await axiosClient.post(`/amenities/${id}/book`, payload);
  return res.data;
};

export const getMyBookings = async () => {
  const res = await axiosClient.get("/amenities/my-bookings");
  return res.data;
};

export const createAmenity = async (payload) => {
  const res = await axiosClient.post("/amenities", payload);
  return res.data;
};
