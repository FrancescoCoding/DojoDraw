// src/axiosConfig.ts
import axios from "axios";

import { API_BASE_URL } from "@/shared/services/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Allows cookies to be sent with requests (important for sessions)
  headers: {
    "Content-Type": "application/json", // Default Content-Type header
  },
});

// Response interceptors
axiosInstance.interceptors.request.use(
  (config) => {
    // Perform actions before request is sent
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Request interceptors
axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx causes this function to trigger
    return response;
  },
  (error) => {
    // Any status codes outside the range of 2xx cause this function to trigger
    return Promise.reject(error);
  }
);

export default axiosInstance;
