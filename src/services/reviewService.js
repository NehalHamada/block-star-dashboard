import axiosInstance from "./axiosInstance";

export const reviewService = {
  // GET /admin/reviews?product_id=&rating=&page=
  async getAll({ product_id = "", rating = "", page = 1 } = {}) {
    try {
      const params = { page };
      if (product_id) params.product_id = product_id;
      if (rating) params.rating = rating;

      const response = await axiosInstance.get("/admin/reviews", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // DELETE /admin/reviews/:id
  async delete(id) {
    try {
      const response = await axiosInstance.delete(`/admin/reviews/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default reviewService;
