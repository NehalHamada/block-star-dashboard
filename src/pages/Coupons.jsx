import { useState, useEffect, memo } from "react";
import { Plus, Tag, Percent, DollarSign, CheckCircle2, XCircle, Clock, Trash2, Pencil } from "lucide-react";
import couponsService from "../services/couponsService";
import toast from "react-hot-toast";
import ModalShell from "../components/common/ModalShell";
import CouponForm from "../components/dashboard/CouponForm";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";

// ── Badges ────────────────────────────────────────────────────────────────────
const TypeBadge = memo(({ type }) =>
  type === "percentage" ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
      <Percent size={11} /> نسبة مئوية
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
      <DollarSign size={11} /> مبلغ ثابت
    </span>
  ),
);

const StatusBadge = memo(({ isActive, isValid }) => {
  if (!isActive)
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        <XCircle size={11} /> معطّل
      </span>
    );
  if (!isValid)
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
        <XCircle size={11} /> منتهي
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      <CheckCircle2 size={11} /> فعّال
    </span>
  );
});

// ── Add Modal ─────────────────────────────────────────────────────────────────
const EMPTY_FORM = { code: "", type: "percentage", value: "", min_order_amount: "0", max_uses: "", expires_at: "", is_active: true };

const AddModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value) { toast.error("الكود والقيمة مطلوبان"); return; }
    setSaving(true);
    try {
      const res = await couponsService.createCoupon(form);
      toast.success(res.message || "تم إنشاء الكوبون بنجاح");
      onCreated(res.data);
      onClose();
    } catch (err) {
      toast.error(err.message || "فشل إنشاء الكوبون");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="إضافة كوبون جديد" onClose={onClose}>
      <CouponForm form={form} set={set} saving={saving} submitLabel="إنشاء الكوبون" onSubmit={handleSubmit} onClose={onClose} />
    </ModalShell>
  );
};

// ── Edit Modal ────────────────────────────────────────────────────────────────
const EditModal = ({ coupon, onClose, onUpdated }) => {
  const toLocalDT = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const [form, setForm] = useState({
    code: coupon.code,
    type: coupon.type,
    value: String(parseFloat(coupon.value)),
    min_order_amount: String(parseFloat(coupon.min_order_amount)),
    max_uses: coupon.max_uses ? String(coupon.max_uses) : "",
    expires_at: toLocalDT(coupon.expires_at),
    is_active: coupon.is_active,
  });
  const [saving, setSaving] = useState(false);
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value) { toast.error("الكود والقيمة مطلوبان"); return; }
    setSaving(true);
    try {
      const res = await couponsService.updateCoupon(coupon.id, form);
      toast.success(res.message || "تم تحديث الكوبون بنجاح");
      onUpdated({ ...coupon, ...form, ...res.data });
      onClose();
    } catch (err) {
      toast.error(err.message || "فشل تحديث الكوبون");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="تعديل كوبون" onClose={onClose}>
      <CouponForm form={form} set={set} saving={saving} submitLabel="حفظ التعديل" onSubmit={handleSubmit} onClose={onClose} />
    </ModalShell>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const TABLE_HEADERS = ["الكود", "النوع", "القيمة", "الحد الأدنى", "الاستخدام", "تاريخ الانتهاء", "الحالة", ""];

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })
    : "—";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await couponsService.getCoupons();
        setCoupons(res.data ?? []);
      } catch (err) {
        setError(err.message || "حدث خطأ أثناء جلب الكوبونات");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await couponsService.deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("تم حذف الكوبون بنجاح");
    } catch (err) {
      toast.error(err.message || "فشل حذف الكوبون");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="الكوبونات" subtitle={`${coupons.length} كوبون`}>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium hover:opacity-90 transition-colors shadow-sm"
        >
          <Plus size={16} />
          إضافة كوبون
        </button>
      </PageHeader>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50">
                <div className="h-7 w-28 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-4 w-14 bg-gray-100 rounded animate-pulse" />
                <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-40 text-red-500 text-sm">{error}</div>
        ) : coupons.length === 0 ? (
          <EmptyState icon={Tag} message="لا توجد كوبونات بعد" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {TABLE_HEADERS.map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-secondary bg-secondary/5 px-2.5 py-1 rounded-lg text-sm tracking-wider">
                        {c.code}
                      </span>
                    </td>
                    <td className="px-5 py-4"><TypeBadge type={c.type} /></td>
                    <td className="px-5 py-4 font-semibold text-gray-800">
                      {c.type === "percentage" ? `${parseFloat(c.value)}%` : `${parseFloat(c.value).toLocaleString()} ر.س`}
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {parseFloat(c.min_order_amount) > 0 ? `${parseFloat(c.min_order_amount).toLocaleString()} ر.س` : "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {c.used_count ?? 0}{c.max_uses ? ` / ${c.max_uses}` : ""}
                    </td>
                    <td className="px-5 py-4 text-gray-400 whitespace-nowrap">
                      {c.expires_at ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(c.expires_at)}
                        </span>
                      ) : (
                        "بلا انتهاء"
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge isActive={c.is_active} isValid={c.is_valid} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingCoupon(c)}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-secondary hover:bg-secondary/5 transition-colors"
                          title="تعديل الكوبون"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="حذف الكوبون"
                        >
                          {deletingId === c.id ? (
                            <span className="inline-block w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onCreated={(c) => setCoupons((p) => [c, ...p])} />}
      {editingCoupon && (
        <EditModal
          coupon={editingCoupon}
          onClose={() => setEditingCoupon(null)}
          onUpdated={(u) => setCoupons((p) => p.map((c) => (c.id === u.id ? { ...c, ...u } : c)))}
        />
      )}
    </div>
  );
};

export default Coupons;
