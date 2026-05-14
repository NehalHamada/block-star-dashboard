import axiosInstance from "./axiosInstance";

export const contactMessageService = {
  // GET /admin/messages >>>>>>>>get all user
  async getAll() {
    try {
      const response = await axiosInstance.get("/admin/messages");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // DELETE /admin/contact-messages/:id
  async delete(id) {
    try {
      const response = await axiosInstance.delete(`/admin/messages/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default contactMessageService;
