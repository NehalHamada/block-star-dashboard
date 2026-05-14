import { useState, useEffect } from "react";
import { Edit3, Save, X, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import partnersService from "../services/partnersService";
import toast from "react-hot-toast";

// ── Image picker ────────────────────────────────────────────────────────────
const ImagePicker = ({ currentUrl, previewUrl, onFileChange }) => (
  <div className="relative group w-36 h-36 shrink-0">
    {previewUrl || currentUrl ? (
      <img
        src={previewUrl || currentUrl}
        alt="feature"
        className="w-36 h-36 object-cover rounded-xl border border-light-gray/10"
      />
    ) : (
      <div className="w-36 h-36 rounded-xl border-2 border-dashed border-light-gray/20 flex items-center justify-center bg-light-beige/30">
        <ImageIcon size={28} className="text-light-gray" />
      </div>
    )}
    <input
      type="file"
      accept="image/*"
      onChange={onFileChange}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
    />
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center pointer-events-none">
      <ImageIcon className="text-white" size={22} />
    </div>
  </div>
);

// ── Main Page ────────────────────────────────────────────────────────────────
const CompanyFeatures = () => {
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchFeatures = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const d = await partnersService.getFeaturesBoth();
      setData(d);
      setForm({
        ...d,
        image_file: null,
        image_preview: null,
      });
    } catch (err) {
      setFetchError(err.message || "حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  // ── Image change ───────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setForm((prev) => {
      if (prev.image_preview) URL.revokeObjectURL(prev.image_preview);
      return { ...prev, image_file: file, image_preview: previewUrl };
    });
  };

  // ── Points management ──────────────────────────────────────────────────────
  const handlePointChange = (index, value) => {
    setForm((prev) => {
      const points = [...prev.points];
      points[index] = value;
      return { ...prev, points };
    });
  };

  const handlePointEnChange = (index, value) => {
    setForm((prev) => {
      const points_en = [...prev.points_en];
      points_en[index] = value;
      return { ...prev, points_en };
    });
  };

  const handleAddPoint = () => {
    setForm((prev) => ({ ...prev, points: [...prev.points, ""] }));
  };

  const handleAddPointEn = () => {
    setForm((prev) => ({ ...prev, points_en: [...prev.points_en, ""] }));
  };

  const handleRemovePoint = (index) => {
    setForm((prev) => ({
      ...prev,
      points: prev.points.filter((_, i) => i !== index),
    }));
  };

  const handleRemovePointEn = (index) => {
    setForm((prev) => ({
      ...prev,
      points_en: prev.points_en.filter((_, i) => i !== index),
    }));
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("العنوان مطلوب");
      return;
    }
    setSaving(true);
    try {
      await partnersService.updateFeatures(data.id, form);
      toast.success("تم حفظ التغييرات بنجاح");
      setEditing(false);
      fetchFeatures();
    } catch (err) {
      const msg = err?.errors
        ? Object.values(err.errors)[0][0]
        : err?.message || "فشل الحفظ، حاول مجدداً";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel ─────────────────────────────────────────────────────────────────
  const handleCancel = () => {
    if (form?.image_preview) URL.revokeObjectURL(form.image_preview);
    setForm({
      ...data,
      image_file: null,
      image_preview: null,
    });
    setEditing(false);
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-52 bg-light-gray/10 rounded-lg animate-pulse" />
        <div className="h-64 bg-light-gray/5 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">
        {fetchError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-black">
            مميزات الشركة
          </h1>
          <p className="text-sm text-dark-gray mt-0.5">
            إدارة قسم "لماذا تختارنا؟"
          </p>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-light-gray/20 text-dark-gray text-sm font-medium hover:bg-light-beige/40 transition-colors"
              >
                <X size={15} />
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                <Save size={15} />
                {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Edit3 size={15} />
              تعديل
            </button>
          )}
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-light-gray/10 bg-light-beige/30">
          <ImageIcon size={18} className="text-secondary" />
          <h2 className="text-sm font-semibold text-dark-gray">بيانات القسم</h2>
        </div>

        <div className="p-6">
          {editing ? (
            /* ── Edit mode ── */
            <div className="space-y-6">
              {/* Image */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-dark-gray uppercase tracking-wide">
                  الصورة
                </label>
                <ImagePicker
                  currentUrl={form.image_url}
                  previewUrl={form.image_preview}
                  onFileChange={handleImageChange}
                />
                <p className="text-[10px] text-dark-gray">
                  اضغط على الصورة لتغييرها (PNG, JPG)
                </p>
              </div>

              {/* Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-dark-gray uppercase tracking-wide">
                    العنوان (AR) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-light-gray/20 rounded-lg text-sm text-text-black focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-dark-gray uppercase tracking-wide">
                    Title (EN) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={form.title_en}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title_en: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-light-gray/20 rounded-lg text-sm text-text-black focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-white"
                  />
                </div>
              </div>

              {/* Points Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Points AR */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-dark-gray uppercase tracking-wide">
                    النقاط (AR)
                  </label>
                  <div className="space-y-2">
                    {form.points.map((point, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          dir="rtl"
                          value={point}
                          onChange={(e) =>
                            handlePointChange(index, e.target.value)
                          }
                          placeholder={`النقطة ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-light-gray/20 rounded-lg text-sm text-text-black focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePoint(index)}
                          disabled={form.points.length === 1}
                          className="p-2 rounded-lg text-light-gray hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPoint}
                    className="flex items-center gap-1.5 w-fit text-sm text-secondary hover:opacity-80 font-medium mt-1"
                  >
                    <Plus size={14} />
                    إضافة نقطة
                  </button>
                </div>

                {/* Points EN */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-dark-gray uppercase tracking-wide">
                    Points (EN)
                  </label>
                  <div className="space-y-2">
                    {form.points_en.map((point, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          dir="ltr"
                          value={point}
                          onChange={(e) => handlePointEnChange(index, e.target.value)}
                          placeholder={`Point ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-light-gray/20 rounded-lg text-sm text-text-black focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePointEn(index)}
                          disabled={form.points_en.length === 1}
                          className="p-2 rounded-lg text-light-gray hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPointEn}
                    className="flex items-center gap-1.5 w-fit text-sm text-secondary hover:opacity-80 font-medium mt-1"
                  >
                    <Plus size={14} />
                    Add Point
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── View mode ── */
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image */}
              {data?.image_url && (
                <img
                  src={data.image_url}
                  alt="feature"
                  className="w-44 h-44 object-cover rounded-xl border border-light-gray/10 shrink-0"
                />
              )}

              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Arabic side */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-light-gray uppercase mb-1">
                        العنوان (AR)
                      </p>
                      <p className="text-lg font-bold text-text-black">
                        {data?.title || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-light-gray uppercase mb-2">
                        النقاط (AR)
                      </p>
                      {data?.points?.length > 0 ? (
                        <ul className="space-y-1.5">
                          {data.points.map((point, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-text-black"
                            >
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-400">لا توجد نقاط</p>
                      )}
                    </div>
                  </div>

                  {/* English side */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-light-gray uppercase mb-1">
                        Title (EN)
                      </p>
                      <p className="text-lg font-bold text-text-black">
                        {data?.title_en || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-light-gray uppercase mb-2">
                        Points (EN)
                      </p>
                      {data?.points_en?.length > 0 ? (
                        <ul className="space-y-1.5">
                          {data.points_en.map((point, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-text-black"
                            >
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-dark-gray">No points added</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyFeatures;
