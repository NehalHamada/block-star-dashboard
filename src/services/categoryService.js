import axiosInstance from "./axiosInstance";

export const categoryService = {
  // GET /categories
  async getAll() {
    try {
      const response = await axiosInstance.get("/categories");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // GET /categories/:id
  async getById(id) {
    try {
      const response = await axiosInstance.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // POST /categories
  // Body (form-data): name (Text), description (Text), image (File)
  async create(categoryData) {
    try {
      const formData = new FormData();
      formData.append("name", categoryData.name || "");
      formData.append("name_en", categoryData.name_en || "");
      formData.append("description", categoryData.description || "");
      formData.append("description_en", categoryData.description_en || "");
      if (categoryData.image instanceof File) {
        formData.append("image", categoryData.image);
      }

      const response = await axiosInstance.post("/categories", formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // POST /categories/:id/update
  // Body (form-data): name (Text), description (Text), image (File – optional)
  async update(id, categoryData) {
    try {
      const formData = new FormData();
      formData.append("name", categoryData.name || "");
      formData.append("name_en", categoryData.name_en || "");
      formData.append("description", categoryData.description || "");
      formData.append("description_en", categoryData.description_en || "");
      if (categoryData.image instanceof File) {
        formData.append("image", categoryData.image);
      }

      const response = await axiosInstance.post(
        `/categories/${id}/update`,
        formData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // DELETE /categories/:id
  async delete(id) {
    try {
      const response = await axiosInstance.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
