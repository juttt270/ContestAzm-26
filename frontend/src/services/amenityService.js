import axiosClient from "./axiosClient";

const toFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    formData.append(key, value);
  });
  return formData;
};

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

/** payload may include an `image` File — sent as multipart when present. */
export const createAmenity = async (payload) => {
  const res = await axiosClient.post("/amenities", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
