import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://ahdafweb.com/WoodenApi/public/api",
  headers: {
    Accept: "application/json",
  },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (!config.headers["Accept-Language"]) {
      const lang = localStorage.getItem("lang") || "ar";
      config.headers["Accept-Language"] = lang;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
