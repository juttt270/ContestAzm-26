import axiosClient from "./axiosClient";

/** Backend ka health check — connection verify karne ke liye. */
export const getHealth = () => axiosClient.get("/health");
