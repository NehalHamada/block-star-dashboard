import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

import axiosInstance from "../axiosInstance";
import orderService from "../orderService";

const mockOrdersResponse = {
  success: true,
  data: {
    current_page: 1,
    data: [{ id: 1, status: "pending" }],
    total: 1,
  },
};

describe("orderService.getOrders", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls GET /admin/orders without params when filters are empty", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockOrdersResponse });

    const result = await orderService.getOrders();

    expect(axiosInstance.get).toHaveBeenCalledWith("/admin/orders", {
      params: {},
    });
    expect(result).toEqual(mockOrdersResponse);
  });

  it("passes status filter as query param", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockOrdersResponse });

    await orderService.getOrders({ status: "delivered" });

    expect(axiosInstance.get).toHaveBeenCalledWith("/admin/orders", {
      params: { status: "delivered" },
    });
  });

  it("passes multiple filters simultaneously", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockOrdersResponse });

    await orderService.getOrders({
      status: "pending",
      payment_method: "cash_on_delivery",
      page: 2,
    });

    expect(axiosInstance.get).toHaveBeenCalledWith("/admin/orders", {
      params: { status: "pending", payment_method: "cash_on_delivery", page: 2 },
    });
  });

  it("throws when API call fails", async () => {
    axiosInstance.get.mockRejectedValueOnce({
      response: { data: { message: "Server error" } },
    });

    await expect(orderService.getOrders()).rejects.toMatchObject({
      message: "Server error",
    });
  });
});

describe("orderService.getOrderById", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls GET /admin/orders/:id", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { success: true, data: { id: 42 } } });

    const result = await orderService.getOrderById(42);

    expect(axiosInstance.get).toHaveBeenCalledWith("/admin/orders/42");
    expect(result.data.id).toBe(42);
  });
});

describe("orderService.updateOrderStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("posts tracking_status to /admin/orders/:id/status", async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { success: true } });

    await orderService.updateOrderStatus(10, "shipped");

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/admin/orders/10/status",
      { tracking_status: "shipped" }
    );
  });
});

describe("orderService.updatePaymentStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("posts payment_status to /admin/orders/:id/payment-status", async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { success: true } });

    await orderService.updatePaymentStatus(10, "paid");

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/admin/orders/10/payment-status",
      { payment_status: "paid" }
    );
  });
});

describe("orderService.sendInvoiceWhatsapp", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends FormData with invoice_pdf field", async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { success: true } });
    const fakeBlob = new Blob(["pdf content"], { type: "application/pdf" });

    await orderService.sendInvoiceWhatsapp(5, fakeBlob);

    const [url, body, config] = axiosInstance.post.mock.calls[0];
    expect(url).toBe("/admin/orders/5/send-invoice-whatsapp");
    expect(body).toBeInstanceOf(FormData);
    expect(config.headers["Content-Type"]).toBe("multipart/form-data");
  });
});
