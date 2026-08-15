import axios from "axios";
import { env } from "@/config/env";

/** Poore app ka single axios instance. */
const axiosClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Har request ke saath token bhej dete hain (agar mojood ho).
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response ko unwrap karte hain aur error ka ek hi shape rakhte hain.
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }

    return Promise.reject({
      status: error.response?.status,
      message,
      errors: error.response?.data?.errors ?? [],
    });
  }
);

export default axiosClient;
