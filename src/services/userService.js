import axiosInstance from "./axiosInstance";

const userService = {
  /**
   * GET /admin/users
   * Optional filters: { search, role, page }
   * search: name | email | phone
   * role:   user | admin
   */
  async getUsers(filters = {}) {
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.role) params.role = filters.role;
      if (filters.page) params.page = filters.page;

      const response = await axiosInstance.get("/admin/users", { params });
      return response.data; // { success, data: { current_page, data: [...], total, ... } }
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * GET /admin/users/:id
   * Returns user details including addresses
   */
  async getUserById(id) {
    try {
      const response = await axiosInstance.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * DELETE /admin/users/:id
   */
  async deleteUser(id) {
    try {
      const response = await axiosInstance.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default userService;
