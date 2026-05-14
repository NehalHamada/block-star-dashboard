import axiosInstance from "./axiosInstance";

export const subCategoryService = {
  // GET /categories/:categoryId/subcategories
  async getAll(categoryId) {
    try {
      const response = await axiosInstance.get(
        `/categories/${categoryId}/subcategories`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // POST /subcategories
  // Body (form-data): category_id (Text), name (Text), description (Text), image (File)
  async create(data) {
    try {
      const formData = new FormData();
      formData.append("category_id", data.category_id);
      formData.append("name", data.name || "");
      formData.append("name_en", data.name_en || "");
      formData.append("description", data.description || "");
      formData.append("description_en", data.description_en || "");
      if (data.image instanceof File) {
        formData.append("image", data.image);
      }

      const response = await axiosInstance.post("/subcategories", formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // POST /subcategories/:id/update
  // Body (form-data): name (Text), description (Text), image (File – optional)
  async update(id, data) {
    try {
      const formData = new FormData();
      formData.append("name", data.name || "");
      formData.append("name_en", data.name_en || "");
      formData.append("description", data.description || "");
      formData.append("description_en", data.description_en || "");
      if (data.image instanceof File) {
        formData.append("image", data.image);
      }

      const response = await axiosInstance.post(
        `/subcategories/${id}/update`,
        formData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // DELETE /subcategories/:id
  async delete(id) {
    try {
      const response = await axiosInstance.delete(`/subcategories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
