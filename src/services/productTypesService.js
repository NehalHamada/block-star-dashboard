import axiosInstance from "./axiosInstance.js";

const productTypesService = {
  async getAllProductTypes() {
    try {
      const response = await axiosInstance.get("/product-types");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async createProductType(data) {
    try {
      const response = await axiosInstance.post("/admin/product-types", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async updateProductType(id, data) {
    try {
      const response = await axiosInstance.post(
        `/admin/product-types/${id}/update`,
        data,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async deleteProductType(id) {
    try {
      const response = await axiosInstance.delete(`/admin/product-types/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  async getAllWoodTypes() {
    try {
      const response = await axiosInstance.get("/wood-types");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  async createWoodType(data) {
    try {
      const response = await axiosInstance.post("/admin/wood-types", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  async updateWoodType(id, data) {
    try {
      const response = await axiosInstance.post(
        `/admin/wood-types/${id}/update`,
        data,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  async deleteWoodType(id) {
    try {
      const response = await axiosInstance.delete(`/admin/wood-types/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default productTypesService;
