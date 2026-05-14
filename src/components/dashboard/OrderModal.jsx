import { useState, memo } from "react";
import { MessageCircle, Printer } from "lucide-react";
import ModalShell from "../common/ModalShell";
import orderService from "../../services/orderService";
import { printInvoice } from "../../utils/printInvoice";

const ORDER_STATUS = {
  pending: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "تم التأكيد", color: "bg-indigo-100 text-indigo-700" },
  processing: { label: "قيد المعالجة", color: "bg-purple-100 text-purple-700" },
  ready: { label: "جاهز للشحن", color: "bg-cyan-100 text-cyan-700" },
  shipped: { label: "تم الشحن", color: "bg-orange-100 text-orange-700" },
  delivered: { label: "تم التسليم", color: "bg-green-100 text-green-700" },
  cancelled: { label: "ملغي", color: "bg-red-100 text-red-700" },
};

const PAYMENT_STATUS = {
  pending: { label: "معلق", color: "bg-yellow-100 text-yellow-700" },
  paid: { label: "مدفوع", color: "bg-green-100 text-green-700" },
  failed: { label: "فشل", color: "bg-red-100 text-red-700" },
};

const PAYMENT_METHOD = {
  cash_on_delivery: "الدفع عند الاستلام",
  myfatoorah: "My Fatoorah",
};

const getInvoicePdfUrl = (order) =>
  order.invoice_pdf_url ||
  order.invoice_url ||
  order.pdf_url ||
  order.invoice?.pdf_url ||
  order.invoice?.url ||
  order.files?.invoice_pdf ||
  "";

const buildWhatsappMessage = (order) => {
  const customerName = order.billing?.name || order.shipping?.full_name || "";
  const invoicePdfUrl = getInvoicePdfUrl(order);
  const lines = [
    `مرحبا ${customerName}`.trim(),
    `فاتورة طلبك رقم ${order.order_number}`,
    `الإجمالي: ${parseFloat(order.total).toLocaleString("ar-EG")} ر.س`,
  ];

  if (invoicePdfUrl) {
    lines.push(`رابط الفاتورة PDF: ${invoicePdfUrl}`);
  }

  return lines.join("\n");
};

const getCustomerPhone = (order) =>
  order.shipping?.phone ||
  order.billing?.phone ||
  order.billing?.phone2 ||
  order.user?.phone ||
  "";

const normalizeWhatsappPhone = (phone) => {
  const digits = String(phone).replace(/\D/g, "");

  if (!digits) return "";
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return `966${digits.slice(1)}`;
  return digits;
};

const openCustomerWhatsapp = (order) => {
  const phone = normalizeWhatsappPhone(getCustomerPhone(order));

  if (!phone) {
    throw new Error("لا يوجد رقم هاتف للعميل في هذا الطلب");
  }

  const message = buildWhatsappMessage(order);
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
};

const StatusBadge = memo(({ map, value }) => {
  const cfg = map[value] ?? {
    label: value,
    color: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
});

const StatusUpdatePanel = memo(
  ({
    label,
    colorClass,
    options,
    selected,
    onSelect,
    saving,
    onSave,
    success,
    error,
    saveLabel,
  }) => {
    const changed = selected !== undefined;
    return (
      <div className={`p-4 rounded-xl space-y-3 ${colorClass}`}>
        <p
          className="text-xs font-semibold uppercase"
          style={{ color: "inherit" }}
        >
          {label}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selected}
            onChange={(e) => onSelect(e.target.value)}
            className="flex-1 min-w-[160px] px-3 py-2 border rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            {Object.entries(options).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <button
            onClick={onSave}
            disabled={saving || !changed}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {saving ? "جارٍ الحفظ..." : saveLabel}
          </button>
        </div>
        {success && (
          <p className="text-xs text-green-600 font-medium">
            ✅ تم التحديث بنجاح
          </p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

/**
 * OrderModal — shows full order details and allows updating order/payment status
 */
const OrderModal = ({ order, onClose, onStatusUpdated }) => {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(
    order.payment_status,
  );
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [whatsappSending, setWhatsappSending] = useState(false);
  const [whatsappError, setWhatsappError] = useState(null);
  const [whatsappSuccess, setWhatsappSuccess] = useState(false);

  const handleSaveStatus = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await orderService.updateOrderStatus(order.id, selectedStatus);
      setSaveSuccess(true);
      onStatusUpdated?.(order.id, { status: selectedStatus });
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message || "فشل تحديث الحالة");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePaymentStatus = async () => {
    setPaymentSaving(true);
    setPaymentError(null);
    setPaymentSuccess(false);
    try {
      await orderService.updatePaymentStatus(order.id, selectedPaymentStatus);
      setPaymentSuccess(true);
      onStatusUpdated?.(order.id, { payment_status: selectedPaymentStatus });
      setTimeout(() => setPaymentSuccess(false), 3000);
    } catch (err) {
      setPaymentError(err.message || "فشل تحديث حالة الدفع");
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleSendWhatsappInvoice = async () => {
    setWhatsappSending(true);
    setWhatsappError(null);
    setWhatsappSuccess(false);

    try {
      openCustomerWhatsapp(order);
      setWhatsappSuccess(true);
      setTimeout(() => setWhatsappSuccess(false), 3000);
    } catch (err) {
      setWhatsappError(
        err.message ||
          "تعذر تجهيز الفاتورة PDF أو فتح واتساب للعميل.",
      );
    } finally {
      setWhatsappSending(false);
    }
  };

  return (
    <ModalShell
      title={order.order_number}
      subtitle={order.tracking_label}
      onClose={onClose}
      maxWidth="max-w-2xl"
      headerActions={
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSendWhatsappInvoice}
            disabled={whatsappSending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-all shadow-sm"
            title="إرسال الفاتورة واتساب"
          >
            {whatsappSending ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <MessageCircle size={15} />
            )}
            <span>{whatsappSending ? "جاري الإرسال..." : "إرسال واتس"}</span>
          </button>
          <button
            onClick={() => printInvoice(order)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:opacity-90 transition-all shadow-sm"
            title="طباعة الفاتورة"
          >
            <Printer size={15} />
            <span>طباعة الفاتورة</span>
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-5">
        {(whatsappSuccess || whatsappError) && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${
              whatsappSuccess
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {whatsappSuccess
              ? "تم فتح واتساب برسالة الفاتورة للعميل"
              : whatsappError}
          </div>
        )}

        {/* Order status update */}
        <StatusUpdatePanel
          label="تحديث حالة الطلب"
          colorClass="bg-secondary/5 border border-secondary/10"
          options={ORDER_STATUS}
          selected={selectedStatus}
          onSelect={setSelectedStatus}
          saving={saving}
          onSave={handleSaveStatus}
          success={saveSuccess}
          error={saveError}
          saveLabel="حفظ الحالة"
        />

        {/* Payment status update */}
        <StatusUpdatePanel
          label="تحديث حالة الدفع"
          colorClass="bg-blue-50 border border-blue-100"
          options={PAYMENT_STATUS}
          selected={selectedPaymentStatus}
          onSelect={setSelectedPaymentStatus}
          saving={paymentSaving}
          onSave={handleSavePaymentStatus}
          success={paymentSuccess}
          error={paymentError}
          saveLabel="حفظ حالة الدفع"
        />

        {/* Current badges */}
        <div className="flex flex-wrap gap-2">
          <StatusBadge map={ORDER_STATUS} value={selectedStatus} />
          <StatusBadge map={PAYMENT_STATUS} value={selectedPaymentStatus} />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {PAYMENT_METHOD[order.payment_method] ?? order.payment_method}
          </span>
        </div>

        {/* Billing & Shipping */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
              بيانات الفواتير
            </p>
            <p className="text-sm font-medium text-gray-800">
              {order.billing.name}
            </p>
            <p className="text-sm text-gray-500">{order.billing.email}</p>
            <p className="text-sm text-gray-500">{order.billing.phone}</p>
            {order.billing.phone2 && (
              <p className="text-sm text-gray-500">{order.billing.phone2}</p>
            )}
          </div>
          <div className="p-4 bg-gray-50 rounded-xl space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
              عنوان الشحن
            </p>
            <p className="text-sm font-medium text-gray-800">
              {order.shipping.full_name}
            </p>
            <p className="text-sm text-gray-500">
              {order.shipping.city} — {order.shipping.area}
            </p>
            <p className="text-sm text-gray-500">{order.shipping.address}</p>
            <p className="text-sm text-gray-500">{order.shipping.phone}</p>
          </div>
        </div>

        {/* Items */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
            المنتجات
          </p>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl"
              >
                <img
                  src={item.product?.main_image}
                  alt={item.product_name}
                  className="w-14 h-14 object-cover rounded-lg flex-shrink-0 bg-gray-100"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    الكمية: {item.quantity} ×{" "}
                    {parseFloat(item.price).toLocaleString()} ر.س
                  </p>
                </div>
                <p className="text-sm font-semibold text-secondary whitespace-nowrap">
                  {parseFloat(item.item_total).toLocaleString()} ر.س
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>المجموع الفرعي</span>
            <span>{parseFloat(order.subtotal).toLocaleString()} ر.س</span>
          </div>
          {order.coupon && (
            <div className="flex justify-between text-sm text-green-600">
              <span>كوبون ({order.coupon.code})</span>
              <span>- {parseFloat(order.discount).toLocaleString()} ر.س</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-gray-900">
            <span>الإجمالي</span>
            <span>{parseFloat(order.total).toLocaleString()} ر.س</span>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="p-3 bg-secondary/5 border border-secondary/10 rounded-xl">
            <p className="text-xs font-semibold text-secondary mb-1">ملاحظات</p>
            <p className="text-sm text-gray-700">{order.notes}</p>
          </div>
        )}

        {/* Payment link */}
        {order.payment_url && (
          <a
            href={order.payment_url}
            target="_blank"
            rel="noreferrer"
            className="block w-full text-center py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:opacity-90 transition-colors"
          >
            رابط الدفع
          </a>
        )}
      </div>
    </ModalShell>
  );
};

export { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD };
export default OrderModal;
