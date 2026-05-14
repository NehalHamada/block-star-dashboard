import axiosInstance from "./axiosInstance";

const statsService = {
  getStats: async () => {
    const response = await axiosInstance.get("/admin/stats");
    return response.data;
  },
};

export default statsService;
