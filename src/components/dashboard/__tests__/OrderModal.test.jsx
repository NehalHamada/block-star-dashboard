import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock axiosInstance ────────────────────────────────────────────────────────
vi.mock("../../services/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// ─── Mock orderService (used inside OrderModal) ───────────────────────────────
vi.mock("../../services/orderService", () => ({
  default: {
    updateOrderStatus: vi.fn(),
    updatePaymentStatus: vi.fn(),
    sendInvoiceWhatsapp: vi.fn(),
  },
}));

// ─── Mock printInvoice ────────────────────────────────────────────────────────
vi.mock("../../utils/printInvoice", () => ({
  printInvoice: vi.fn(),
}));

// ─────────────────────────────────────────────────────────────────────────────
// normalizeWhatsappPhone is not exported, so we test it indirectly via the
// URL built by openCustomerWhatsapp → window.open.
// ─────────────────────────────────────────────────────────────────────────────
import { render, screen, fireEvent } from "@testing-library/react";
import OrderModal from "../OrderModal";

const baseOrder = {
  id: 1,
  order_number: "ORD-001",
  tracking_label: "تم التأكيد",
  status: "confirmed",
  payment_status: "paid",
  payment_method: "cash_on_delivery",
  subtotal: "200",
  total: "230",
  discount: "0",
  notes: "",
  payment_url: "",
  billing: { name: "أحمد", email: "a@b.com", phone: "", phone2: "" },
  shipping: { full_name: "أحمد", city: "الرياض", area: "النزهة", address: "شارع 1", phone: "" },
  items: [],
};

const renderModal = (orderOverrides = {}) => {
  const order = { ...baseOrder, ...orderOverrides };
  return render(
    <OrderModal order={order} onClose={vi.fn()} onStatusUpdated={vi.fn()} />
  );
};

// ─── normalizeWhatsappPhone variants ─────────────────────────────────────────
describe("normalizeWhatsappPhone — Saudi number formatting", () => {
  let windowOpen;

  beforeEach(() => {
    windowOpen = vi.spyOn(window, "open").mockImplementation(() => {});
  });

  const clickWhatsapp = () =>
    fireEvent.click(screen.getByRole("button", { name: /إرسال واتس/i }));

  const extractPhone = () => {
    const url = windowOpen.mock.calls[0]?.[0] ?? "";
    // URL format: https://wa.me/+966XXXXXXXXX?text=...
    const match = url.match(/wa\.me\/([^?]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  it("converts 05XXXXXXXX (Saudi local, leading 0) → +9665XXXXXXXX", () => {
    renderModal({ billing: { ...baseOrder.billing, phone: "0501234567" } });
    clickWhatsapp();
    expect(extractPhone()).toBe("+966501234567");
  });

  it("converts 5XXXXXXXX (bare Saudi, no leading 0) → +9665XXXXXXXX", () => {
    renderModal({ billing: { ...baseOrder.billing, phone: "501234567" } });
    clickWhatsapp();
    expect(extractPhone()).toBe("+966501234567");
  });

  it("converts 966XXXXXXXXX (country code, no prefix) → +966XXXXXXXXX", () => {
    renderModal({ billing: { ...baseOrder.billing, phone: "966501234567" } });
    clickWhatsapp();
    expect(extractPhone()).toBe("+966501234567");
  });

  it("converts 00966XXXXXXXXX (00-prefixed) → +966XXXXXXXXX", () => {
    renderModal({ billing: { ...baseOrder.billing, phone: "00966501234567" } });
    clickWhatsapp();
    expect(extractPhone()).toBe("+966501234567");
  });

  it("converts +966XXXXXXXXX (+ prefixed) → +966XXXXXXXXX", () => {
    renderModal({ billing: { ...baseOrder.billing, phone: "+966501234567" } });
    clickWhatsapp();
    expect(extractPhone()).toBe("+966501234567");
  });

  it("shows error banner when no phone number is present", () => {
    renderModal(); // both billing.phone and shipping.phone are ""
    clickWhatsapp();
    expect(screen.getByText(/لا يوجد رقم هاتف/)).toBeInTheDocument();
    expect(windowOpen).not.toHaveBeenCalled();
  });

  it("prefers shipping.phone over billing.phone", () => {
    renderModal({
      shipping: { ...baseOrder.shipping, phone: "0551112222" },
      billing: { ...baseOrder.billing, phone: "0501234567" },
    });
    clickWhatsapp();
    expect(extractPhone()).toBe("+966551112222");
  });

  it("redirects test number 01094138191 to +966502588864", () => {
    renderModal({ billing: { ...baseOrder.billing, phone: "01094138191" } });
    clickWhatsapp();
    expect(extractPhone()).toBe("+966502588864");
  });
});
