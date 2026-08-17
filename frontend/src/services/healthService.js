import axiosClient from "./axiosClient";

/** Backend ka health check — connection verify karne ke liye. */
export const getHealth = async () => {
  const res = await axiosClient.get("/health");
  return res.data;
};
