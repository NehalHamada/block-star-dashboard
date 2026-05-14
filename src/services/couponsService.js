import axiosInstance from "./axiosInstance";

const couponsService = {
  /** GET /admin/coupons */
  async getCoupons() {
    try {
      const response = await axiosInstance.get("/admin/coupons");
      return response.data; // { success, count, data: [...] }
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * POST /admin/coupons
   * Fields: code, type (percentage|fixed), value, min_order_amount,
   *         max_uses (optional), expires_at (optional), is_active
   */
  async createCoupon(form) {
    try {
      const data = new FormData();
      data.append("code", form.code);
      data.append("type", form.type);
      data.append("value", form.value);
      data.append("min_order_amount", form.min_order_amount ?? "0");
      data.append("is_active", form.is_active ? "1" : "0");
      if (form.max_uses) data.append("max_uses", form.max_uses);
      if (form.expires_at) data.append("expires_at", form.expires_at);

      const response = await axiosInstance.post("/admin/coupons", data);
      return response.data; // { success, message, data: { ...coupon } }
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /** DELETE /admin/coupons/:id */
  async deleteCoupon(id) {
    try {
      const response = await axiosInstance.delete(`/admin/coupons/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * POST /admin/coupons/:id/update
   * Same fields as createCoupon
   */
  async updateCoupon(id, form) {
    try {
      const data = new FormData();
      data.append("code", form.code);
      data.append("type", form.type);
      data.append("value", form.value);
      data.append("min_order_amount", form.min_order_amount ?? "0");
      data.append("is_active", form.is_active ? "1" : "0");
      if (form.max_uses) data.append("max_uses", form.max_uses);
      if (form.expires_at) data.append("expires_at", form.expires_at);

      const response = await axiosInstance.post(
        `/admin/coupons/${id}/update`,
        data,
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default couponsService;
