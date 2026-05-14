import axiosInstance from "./axiosInstance";

const orderService = {
  /**
   * GET /admin/orders
   * Optional filters: { status, payment_method, payment_status, page }
   * status values:    pending | confirmed | processing | ready | shipped | delivered | cancelled
   * payment_method:  cash_on_delivery | myfatoorah
   * payment_status:  pending | paid | failed
   */

  async getOrders(filters = {}) {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.payment_method)
        params.payment_method = filters.payment_method;
      if (filters.payment_status)
        params.payment_status = filters.payment_status;
      if (filters.page) params.page = filters.page;

      const response = await axiosInstance.get("/admin/orders", { params });
      console.log(response.data);

      return response.data; // { success, data: { current_page, data: [...], total, ... } }
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * GET /admin/orders/:id
   * Returns full order details
   */
  async getOrderById(id) {
    try {
      const response = await axiosInstance.get(`/admin/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * POST /admin/orders/:id/status
   * status: pending | confirmed | processing | ready | shipped | delivered | cancelled
   */
  async updateOrderStatus(id, status) {
    try {
      const response = await axiosInstance.post(`/admin/orders/${id}/status`, {
        tracking_status: status,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * POST /admin/orders/:id/payment-status
   * payment_status: pending | paid | failed
   */
  async updatePaymentStatus(id, paymentStatus) {
    try {
      const response = await axiosInstance.post(
        `/admin/orders/${id}/payment-status`,
        {
          payment_status: paymentStatus,
        },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * POST /admin/orders/:id/send-invoice-whatsapp
   * Backend should generate or fetch the invoice PDF and send it as a WhatsApp
   * document attachment to the customer's phone number on the order.
   */
  async sendInvoiceWhatsapp(id, invoicePdf) {
    try {
      const formData = new FormData();

      formData.append("invoice_pdf", invoicePdf);

      const response = await axiosInstance.post(
        `/admin/orders/${id}/send-invoice-whatsapp`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default orderService;
