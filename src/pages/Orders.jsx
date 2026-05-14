import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Eye, X, Package } from "lucide-react";
import orderService from "../services/orderService";
import OrderModal, { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from "../components/dashboard/OrderModal";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import Pagination from "../components/common/Pagination";
import SearchInput from "../components/common/SearchInput";
import FilterSelect from "../components/common/FilterSelect";

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = memo(({ map, value }) => {
  const cfg = map[value] ?? { label: value, color: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
});

// ── Table skeleton ────────────────────────────────────────────────────────────
const TableSkeleton = memo(() => (
  <div className="space-y-0">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50">
        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
      </div>
    ))}
  </div>
));

// ── Orders table (pure presentational) ───────────────────────────────────────
const TABLE_HEADERS = ["رقم الطلب", "العميل", "التاريخ", "المنتجات", "الإجمالي", "حالة الطلب", "حالة الدفع", "طريقة الدفع", ""];

const OrdersTable = memo(({ orders, onOpen, loadingId }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-right">
      <thead>
        <tr className="border-b border-gray-100 bg-gray-50">
          {TABLE_HEADERS.map((h) => (
            <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {orders.map((order) => (
          <tr key={order.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{order.order_number}</td>
            <td className="px-4 py-3">
              <p className="font-medium text-gray-800">{order.billing?.name}</p>
              <p className="text-xs text-gray-400">{order.billing?.email}</p>
            </td>
            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
              {new Date(order.created_at).toLocaleDateString("ar-EG")}
            </td>
            <td className="px-4 py-3 text-center text-gray-600">{order.items_count}</td>
            <td className="px-4 py-3 font-semibold text-secondary whitespace-nowrap">
              {parseFloat(order.total).toLocaleString()} ر.س
            </td>
            <td className="px-4 py-3">
              <StatusBadge map={ORDER_STATUS} value={order.status} />
            </td>
            <td className="px-4 py-3">
              <StatusBadge map={PAYMENT_STATUS} value={order.payment_status} />
            </td>
            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
              {PAYMENT_METHOD[order.payment_method] ?? order.payment_method}
            </td>
            <td className="px-4 py-3">
              <button
                onClick={() => onOpen(order.id)}
                disabled={!!loadingId}
                className="p-1.5 rounded-lg text-gray-400 hover:text-secondary hover:bg-secondary/5 transition-colors disabled:opacity-50"
                title="عرض التفاصيل"
              >
                {loadingId === order.id ? (
                  <span className="inline-block w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

// ── Main Page ─────────────────────────────────────────────────────────────────
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoadingId, setModalLoadingId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

  const fetchOrders = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const res = await orderService.getOrders({
          status: statusFilter || undefined,
          payment_method: paymentMethodFilter || undefined,
          payment_status: paymentStatusFilter || undefined,
          page,
        });
        const paged = res.data;
        setOrders(paged.data ?? []);
        setCurrentPage(paged.current_page ?? 1);
        setLastPage(paged.last_page ?? 1);
        setTotal(paged.total ?? 0);
      } catch (err) {
        setError(err.message || "حدث خطأ أثناء جلب الطلبات");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, paymentMethodFilter, paymentStatusFilter],
  );

  useEffect(() => {
    setCurrentPage(1);
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, paymentMethodFilter, paymentStatusFilter]);

  // Client-side search filter with useMemo for performance
  const displayed = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return orders;
    return orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(term) ||
        o.billing?.name?.toLowerCase().includes(term) ||
        o.billing?.email?.toLowerCase().includes(term) ||
        o.billing?.phone?.includes(term),
    );
  }, [orders, search]);

  const openOrder = useCallback(async (id) => {
    setModalLoadingId(id);
    setSelectedOrder(null);
    try {
      const res = await orderService.getOrderById(id);
      setSelectedOrder(res.data ?? res);
    } catch {
      setSelectedOrder(orders.find((o) => o.id === id) ?? null);
    } finally {
      setModalLoadingId(null);
    }
  }, [orders]);

  const hasFilters = statusFilter || paymentMethodFilter || paymentStatusFilter;

  const clearFilters = useCallback(() => {
    setStatusFilter("");
    setPaymentMethodFilter("");
    setPaymentStatusFilter("");
    setSearch("");
  }, []);

  const statusOptions = useMemo(
    () => Object.entries(ORDER_STATUS).map(([k, v]) => ({ value: k, label: v.label })),
    [],
  );
  const paymentStatusOptions = useMemo(
    () => Object.entries(PAYMENT_STATUS).map(([k, v]) => ({ value: k, label: v.label })),
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="الطلبات" subtitle={`إجمالي ${total} طلب`} />

      {/* Filters bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم، البريد، رقم الطلب..."
          />

          <FilterSelect
            label="كل الحالات"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />

          <FilterSelect
            label="طريقة الدفع"
            value={paymentMethodFilter}
            onChange={setPaymentMethodFilter}
            options={[
              { value: "cash_on_delivery", label: "الدفع عند الاستلام" },
              { value: "myfatoorah", label: "My Fatoorah" },
            ]}
          />

          <FilterSelect
            label="حالة الدفع"
            value={paymentStatusFilter}
            onChange={setPaymentStatusFilter}
            options={paymentStatusOptions}
          />

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <X size={14} />
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="flex items-center justify-center h-48 text-red-500 text-sm">{error}</div>
        ) : displayed.length === 0 ? (
          <EmptyState icon={Package} message="لا توجد طلبات" />
        ) : (
          <OrdersTable orders={displayed} onOpen={openOrder} loadingId={modalLoadingId} />
        )}

        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          onPrev={() => fetchOrders(currentPage - 1)}
          onNext={() => fetchOrders(currentPage + 1)}
        />
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdated={(id, updates) => {
            setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
            setSelectedOrder((prev) => (prev ? { ...prev, ...updates } : prev));
          }}
        />
      )}
    </div>
  );
};

export default Orders;
