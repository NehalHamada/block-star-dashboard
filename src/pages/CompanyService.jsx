import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import partnersService from "../services/partnersService";
import toast from "react-hot-toast";

// ── Image picker ────────────────────────────────────────────────────────────
const ImagePicker = ({ currentUrl, previewUrl, onFileChange }) => (
  <div className="relative group w-20 h-20 shrink-0">
    {previewUrl || currentUrl ? (
      <img
        src={previewUrl || currentUrl}
        alt="service"
        className="w-20 h-20 object-cover rounded-xl border border-light-gray/10"
      />
    ) : (
      <div className="w-20 h-20 rounded-xl border-2 border-dashed border-light-gray/20 flex items-center justify-center bg-light-beige/30">
        <ImageIcon size={22} className="text-light-gray" />
      </div>
    )}
    <input
      type="file"
      accept="image/*"
      onChange={onFileChange}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
    />
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center pointer-events-none">
      <ImageIcon className="text-white" size={18} />
    </div>
  </div>
);

// ── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
      <ImageIcon size={28} className="text-secondary" />
    </div>
    <p className="text-dark-gray text-sm mb-4">لا توجد خدمات مضافة بعد</p>
    <button
      onClick={onAdd}
      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:opacity-90 transition-opacity"
    >
      <Plus size={15} />
      إضافة أول خدمة
    </button>
  </div>
);

// ── Service Row ──────────────────────────────────────────────────────────────
const ServiceRow = ({ service, onEdit, onDelete, deleting }) => (
  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-light-gray/10 shadow-sm hover:shadow-md transition-shadow">
    {service.image_url ? (
      <img
        src={service.image_url}
        alt={service.title}
        className="w-14 h-14 object-cover rounded-lg border border-light-gray/10 shrink-0"
      />
    ) : (
      <div className="w-14 h-14 rounded-lg border-2 border-dashed border-light-gray/20 flex items-center justify-center bg-light-beige/30 shrink-0">
        <ImageIcon size={18} className="text-light-gray" />
      </div>
    )}

    <div className="flex-1 min-w-0">
      <p className="font-semibold text-text-black text-sm truncate">
        {service.title}
      </p>
      <p className="text-xs text-dark-gray mt-0.5">
        ترتيب: {service.sort_order}
      </p>
    </div>

    <span
      className={`shrink-0 flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
        service.is_active
          ? "bg-green-50 text-green-600"
          : "bg-light-gray/10 text-dark-gray"
      }`}
    >
      {service.is_active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
      {service.is_active ? "نشطة" : "معطلة"}
    </span>

    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={() => onEdit(service)}
        className="p-2 rounded-lg text-dark-gray hover:text-secondary hover:bg-secondary/10 transition-colors"
        title="تعديل"
      >
        <Edit3 size={15} />
      </button>
      <button
        onClick={() => onDelete(service.id)}
        disabled={deleting === service.id}
        className="p-2 rounded-lg text-dark-gray hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
        title="حذف"
      >
        <Trash2 size={15} />
      </button>
    </div>
  </div>
);

// ── Service Modal (Add / Edit) ───────────────────────────────────────────────
const ServiceModal = ({ service, onClose, onSaved }) => {
  const isEdit = !!service;
  const [form, setForm] = useState({
    title: service?.title ?? "",
    title_en: service?.title_en ?? "",
    sort_order: service?.sort_order ?? 0,
    image_file: null,
    image_preview: null,
    image_url: service?.image_url ?? null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setForm((prev) => {
      if (prev.image_preview) URL.revokeObjectURL(prev.image_preview);
      return { ...prev, image_file: file, image_preview: previewUrl };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("العنوان مطلوب");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await partnersService.updateService(service.id, form);
        toast.success("تم تعديل الخدمة بنجاح");
      } else {
        await partnersService.addService(form);
        toast.success("تم إضافة الخدمة بنجاح");
      }
      onSaved();
    } catch (err) {
      const msg = err?.errors
        ? Object.values(err.errors)[0][0]
        : err?.message || "حدث خطأ، حاول مجدداً";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-gray/10">
          <h2 className="text-base font-semibold text-text-black">
            {isEdit ? "تعديل الخدمة" : "إضافة خدمة"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-light-gray/10 text-dark-gray transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Image */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-dark-gray uppercase tracking-wide">
              الصورة
            </label>
            <ImagePicker
              currentUrl={form.current_image}
              previewUrl={form.image_preview}
              onFileChange={handleImageChange}
            />
            <p className="text-[10px] text-dark-gray">
              اضغط على الصورة لتغييرها (PNG, JPG)
            </p>
          </div>

          {/* Title AR */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-dark-gray uppercase tracking-wide">
              عنوان الخدمة (AR) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              dir="rtl"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="مثال: تصميم داخلي"
              className="w-full px-3 py-2 border border-light-gray/20 rounded-lg text-sm text-text-black focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-white"
            />
          </div>

          {/* Title EN */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-dark-gray uppercase tracking-wide">
              Service Title (EN) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              dir="ltr"
              value={form.title_en}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title_en: e.target.value }))
              }
              placeholder="e.g., Interior Design"
              className="w-full px-3 py-2 border border-light-gray/20 rounded-lg text-sm text-text-black focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-white"
            />
          </div>

          {/* Sort order */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-dark-gray uppercase tracking-wide">
              الترتيب
            </label>
            <input
              type="number"
              min={0}
              value={form.sort_order}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  sort_order: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-light-gray/20 rounded-lg text-sm text-text-black focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-white"
            />
          </div>
 drum
          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-light-gray/20 text-dark-gray text-sm font-medium hover:bg-light-beige/40 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              <Save size={14} />
              {saving ? "جارٍ الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة"}
            </button>
          </div>
 drum        </form>
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const CompanyService = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [modal, setModal] = useState(null); // null | "add" | { service }
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const fetchServices = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await partnersService.getServicesBoth();
      setServices(res);
    } catch (err) {
      setFetchError(err.message || "حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الخدمة؟")) return;
    setDeleting(id);
    setDeleteError(null);
    try {
      await partnersService.deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      toast.success("تم حذف الخدمة بنجاح");
    } catch (err) {
      setDeleteError(err.message || "فشل الحذف، حاول مجدداً");
      toast.error(err.message || "فشل الحذف، حاول مجدداً");
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = () => {
    setModal(null);
    fetchServices();
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-52 bg-light-gray/10 rounded-lg animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-light-gray/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-black">خدمات الشركة</h1>
          <p className="text-sm text-dark-gray mt-0.5">
            إدارة خدمات الشركة ({services.length} خدمة)
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          إضافة خدمة
        </button>
      </div>
 drum
      {/* Fetch error */}
      {fetchError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
          {fetchError}
        </div>
      )}

      {/* Delete error */}
      {deleteError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
          {deleteError}
        </div>
      )}

      {/* Services list */}
      {services.length === 0 ? (
        <EmptyState onAdd={() => setModal("add")} />
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <ServiceRow
              key={service.id}
              service={service}
              onEdit={(s) => setModal(s)}
              onDelete={handleDelete}
              deleting={deleting}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ServiceModal
          service={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default CompanyService;
