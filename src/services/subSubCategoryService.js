import axiosInstance from "./axiosInstance";

export const subSubCategoryService = {
  // GET /sub-subcategories
  async getAll() {
    try {
      const response = await axiosInstance.get("/sub-subcategories");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // POST /sub-subcategories
  // Body (form-data): subcategory_id (Text), name (Text), name_en (Text), description (Text), description_en (Text), image (File)
  async create(data) {
    try {
      const formData = new FormData();
      formData.append("subcategory_id", data.subcategory_id);
      formData.append("name", data.name || "");
      formData.append("name_en", data.name_en || "");
      formData.append("description", data.description || "");
      formData.append("description_en", data.description_en || "");
      if (data.image instanceof File) {
        formData.append("image", data.image);
      }

      const response = await axiosInstance.post("/sub-subcategories", formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // POST /sub-subcategories/:id/update
  // Body (form-data): subcategory_id (Text), name (Text), name_en (Text), description (Text), description_en (Text), image (File – optional)
  async update(id, data) {
    try {
      const formData = new FormData();
      formData.append("subcategory_id", data.subcategory_id);
      formData.append("name", data.name || "");
      formData.append("name_en", data.name_en || "");
      formData.append("description", data.description || "");
      formData.append("description_en", data.description_en || "");
      if (data.image instanceof File) {
        formData.append("image", data.image);
      }

      const response = await axiosInstance.post(
        `/sub-subcategories/${id}/update`,
        formData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // DELETE /sub-subcategories/:id
  async delete(id) {
    try {
      const response = await axiosInstance.delete(`/sub-subcategories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
