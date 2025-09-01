import axios from "axios";

// Create instance
export const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/api/v1",
  withCredentials: true,
});

// Attach token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
