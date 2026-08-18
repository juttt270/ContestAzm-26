/**
 * Saari Vite env variables ek hi jagah se.
 * Vite me sirf VITE_ se shuru hone wali variables browser tak aati hain.
 */
export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  APP_NAME: import.meta.env.VITE_APP_NAME || "SmartSociety",
  IS_DEV: import.meta.env.DEV,
};
