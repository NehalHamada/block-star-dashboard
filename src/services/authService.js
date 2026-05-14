import axiosInstance from "./axiosInstance";
import toast from "react-hot-toast";

export const authService = {
  async login(email, password) {
    try {
      const response = await axiosInstance.post("/login", {
        email,
        password,
      });
      console.log(response?.data?.data?.token);
      if (response?.data?.data?.user?.role !== "admin") {
        toast.error("ليس لديك صلاحية الدخول");
        return { success: false, error: "ليس لديك صلاحية الدخول" };
      }

      // Store token and user data
      if (response.data.data.token) {
        localStorage.setItem("adminToken", response.data.data.token);
      }
      if (response.data.data.user) {
        localStorage.setItem(
          "adminData",
          JSON.stringify(response.data.data.user),
        );
      }

      return response?.data?.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  async getUser(token) {
    try {
      const response = await axiosInstance.get("/user", {
        Accept: "application/json",
        Authorization: "Bearer " + token,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async logout() {
    await axiosInstance.post(
      "/logout",
      {},
      {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("adminToken"),
      },
    );

    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
  },

  getToken() {
    return localStorage.getItem("adminToken");
  },

  getCurrentUser() {
    const user = localStorage.getItem("adminData");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
