import axiosInstance from "./axiosInstance";

const companyService = {
  // GET /admin/partner-services
  // Response: { success, data: [{ id, title, image_url, sort_order, is_active }] }
  async getCompanyServices() {
    try {
      const response = await axiosInstance.get("/admin/partner-services");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // POST /admin/partner-services
  // Body (form-data): title (Text), sort_order (Text), image (File)
  async addCompanyService({ title, title_en, sort_order, image }) {
    try {
      const formData = new FormData();
      formData.append("title", title || "");
      formData.append("title_en", title_en || "");
      formData.append("sort_order", sort_order ?? 0);
      if (image) formData.append("image", image);

      const response = await axiosInstance.post(
        "/admin/partner-services",
        formData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // POST /admin/partner-services/:id/update
  // Body (form-data): title (Text), sort_order (Text), image (File – optional)
  async updateCompanyService({ id, title, title_en, sort_order, image }) {
    try {
      const formData = new FormData();
      formData.append("title", title || "");
      formData.append("title_en", title_en || "");
      formData.append("sort_order", sort_order ?? 0);
      if (image) formData.append("image", image);

      const response = await axiosInstance.post(
        `/admin/partner-services/${id}/update`,
        formData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // DELETE /admin/partner-services/:id
  async deleteCompanyService(id) {
    try {
      const response = await axiosInstance.delete(
        `/admin/partner-services/${id}`,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getCompanyFeatures() {
    try {
      const response = await axiosInstance.get("/admin/partner-features");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // POST /admin/partner-features/:id/update
  // Body (form-data): title, points[0], points[1], ..., image (File – optional)
  async updateCompanyFeature({ id, title, title_en, points, points_en, image }) {
    try {
      const formData = new FormData();
      formData.append("title", title || "");
      formData.append("title_en", title_en || "");

      // Append each point as points[0], points[1], …
      (points ?? []).forEach((point, index) => {
        formData.append(`points[${index}]`, point);
      });

      // Append English points
      (points_en ?? []).forEach((point, index) => {
        formData.append(`points_en[${index}]`, point);
      });

      if (image) formData.append("image", image);

      const response = await axiosInstance.post(
        `/admin/partner-features/${id}/update`,
        formData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // POST /admin/partner-requests/:id/status
  // Body (form-data): status (approved | rejected | pending | reviewed | cancelled)
  async updateRequestStatus(id, status) {
    try {
      const formData = new FormData();
      formData.append("status", status);
      const response = await axiosInstance.post(
        `/admin/partner-requests/${id}/status`,
        formData,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // GET /admin/partner-requests
  // Response: { success, count, data: [{ id, company_name, manager_name, phone1, phone2, email, service_type, description, expected_delivery, status, status_label, admin_notes, submitted_at, user }] }
  async getCompanyRequests() {
    try {
      const response = await axiosInstance.get("/admin/partner-requests");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default companyService;
