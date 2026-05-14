import { useState, useEffect } from "react";
import {
  Save,
  Edit3,
  X,
  Image as ImageIcon,
  Users,
  Package,
  Eye,
  Target,
} from "lucide-react";
import aboutAsService from "../services/aboutAsService";
import PageHeader from "../components/common/PageHeader";

// ── Reusable field editor ─────────────────────────────────────────────
const Field = ({
  label,
  value,
  name,
  onChange,
  multiline = false,
  dir = "rtl",
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-dark-gray uppercase tracking-wide">
      {label}
    </label>
    {multiline ? (
      <textarea
        name={name}
        value={value ?? ""}
        onChange={onChange}
        rows={4}
        dir={dir}
        className="w-full px-3 py-2 border border-light-gray/20 rounded-lg text-sm text-text-black focus:outline-none focus:ring-2 focus:ring-secondary/50 resize-none bg-white font-sans"
      />
    ) : (
      <input
        name={name}
        value={value ?? ""}
        onChange={onChange}
        dir={dir}
        className="w-full px-3 py-2 border border-light-gray/20 rounded-lg text-sm text-text-black focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-white font-sans"
      />
    )}
  </div>
);

const ImageField = ({ label, currentImage, onFileChange, previewUrl }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-semibold text-dark-gray uppercase tracking-wide">
      {label}
    </label>
    <div className="relative group w-fit">
      {(previewUrl || currentImage) && (
        <img
          src={previewUrl || currentImage}
          alt="Preview"
          className="h-32 w-32 object-cover rounded-lg border-2 border-dashed border-light-gray/20 p-1"
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
        <ImageIcon className="text-white" size={24} />
      </div>
    </div>
    <p className="text-[10px] text-light-gray">
      اضغط لتغيير الصورة (PNG, JPG, SVG)
    </p>
  </div>
);

// ── Section card wrapper ──────────────────────────────────────────────
const Section = ({ icon, title, children }) => {
  const SectionIcon = icon;
  return (
    <div className="bg-white rounded-xl border border-light-gray/10 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-light-gray/10 bg-light-beige/50">
        <SectionIcon size={18} className="text-secondary" />
        <h2 className="text-sm font-semibold text-dark-gray">{title}</h2>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
};

// ── Stat card (readonly preview) ─────────────────────────────────────
const StatCard = ({ icon, value, description }) => {
  const StatIcon = icon;
  return (
    <div className="flex items-start gap-4 p-4 bg-secondary/5 rounded-xl border border-secondary/10">
      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
        <StatIcon size={18} className="text-secondary" />
      </div>
      <div>
        <div className="text-xl font-bold text-secondary">{value}</div>
        <div className="text-xs text-dark-gray mt-0.5">{description}</div>
      </div>
    </div>
  );
};

// ── Dual-language grid row ────────────────────────────────────────────
// Shows AR field on the left and EN field on the right side by side
const BiField = ({
  label,
  arValue,
  enValue,
  onArChange,
  onEnChange,
  arName,
  enName,
  multiline = false,
}) => (
  <div className="grid grid-cols-2 gap-4 py-3 border-b border-light-gray/5 last:border-0">
    <Field
      label={`${label} — العربية`}
      name={arName}
      value={arValue}
      onChange={onArChange}
      multiline={multiline}
      dir="rtl"
    />
    <Field
      label={`${label} — English`}
      name={enName}
      value={enValue}
      onChange={onEnChange}
      multiline={multiline}
      dir="ltr"
    />
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────
const AboutAs = () => {
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);

  // Shared state: images
  const [sharedImages, setSharedImages] = useState({
    image_file: null,
    image_preview: null,
    store_image_file: null,
    store_image_preview: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tab, setTab] = useState("ar"); // "ar" | "en"

  // ── Fetch ────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await aboutAsService.getAboutBoth();
      setData(d);
      setForm(d);
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Flat field change ──────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setSharedImages((prev) => {
      if (prev[`${field}_preview`])
        URL.revokeObjectURL(prev[`${field}_preview`]);
      return {
        ...prev,
        [`${field}_file`]: file,
        [`${field}_preview`]: previewUrl,
      };
    });
  };

  // ── Save ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await aboutAsService.update({
        ...form,
        image_file: sharedImages.image_file,
        store_image_file: sharedImages.store_image_file,
      });
      const d = await aboutAsService.getAboutBoth();
      setData(d);
      setForm(d);
      setSharedImages({
        image_file: null,
        image_preview: null,
        store_image_file: null,
        store_image_preview: null,
      });
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Update error:", err);
      if (err.errors) {
        setError(Object.values(err.errors)[0][0]);
      } else {
        const msg =
          typeof err === "object" ? err.message || JSON.stringify(err) : err;
        setError(msg || "فشل حفظ التغييرات، حاول مرة أخرى");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (sharedImages.image_preview)
      URL.revokeObjectURL(sharedImages.image_preview);
    if (sharedImages.store_image_preview)
      URL.revokeObjectURL(sharedImages.store_image_preview);
    setForm(data);
    setSharedImages({
      image_file: null,
      image_preview: null,
      store_image_file: null,
      store_image_preview: null,
    });
    setEditing(false);
    setError(null);
  };

  // ── Loading skeleton ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-light-gray/20 rounded-lg animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 bg-light-gray/10 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500 text-sm font-medium">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-secondary text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── Page header ── */}
      <PageHeader title="من نحن" subtitle="إدارة محتوى صفحة من نحن">
        {editing ? (
          <>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-light-gray/20 text-dark-gray text-sm font-medium hover:bg-light-beige transition-colors"
            >
              <X size={15} /> إلغاء
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
            <Edit3 size={15} /> تعديل
          </button>
        )}
      </PageHeader>

      {/* ── Toasts ── */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center">
          ✅ تم حفظ التغييرات بنجاح
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      {/* ── Language tabs ── */}
      <div className="flex items-center border-b border-light-gray/10">
        {[
          { key: "ar", label: "🇸🇦 العربية" },
          { key: "en", label: "🇺🇸 English" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === key
                ? "border-secondary text-secondary"
                : "border-transparent text-dark-gray hover:text-text-black"
            }`}
          >
            {label}
          </button>
        ))}
        {editing && (
          <span className="mr-auto text-xs text-secondary bg-secondary/5 border border-secondary/10 rounded-full px-3 py-1 ml-3">
            🖊 التعديل يشمل اللغتين معاً — أدخل البيانات في الجهتين ثم احفظ
          </span>
        )}
      </div>

      {/* ════════════════════════════ EDIT MODE ════════════════════════════ */}
      {editing ? (
        <div className="space-y-6">
          {/* ── Main Info ── */}
          <Section icon={ImageIcon} title="المعلومات الرئيسية">
            <BiField
              label="العنوان الرئيسي"
              arValue={form?.title || ""}
              enValue={form?.title_en || ""}
              onArChange={handleChange}
              onEnChange={handleChange}
              arName="title"
              enName="title_en"
            />
            <BiField
              label="الوصف الرئيسي"
              arValue={form?.description || ""}
              enValue={form?.description_en || ""}
              onArChange={handleChange}
              onEnChange={handleChange}
              arName="description"
              enName="description_en"
              multiline
            />
            <div className="pt-2">
              <ImageField
                label="الصورة الرئيسية (مشتركة)"
                currentImage={data?.image_url}
                previewUrl={sharedImages.image_preview}
                onFileChange={(e) => handleFileChange(e, "image")}
              />
            </div>
          </Section>

          {/* ── Intro ── */}
          <Section icon={Eye} title="المقدمة">
            <BiField
              label="العنوان"
              arValue={form?.intro_title || ""}
              enValue={form?.intro_title_en || ""}
              onArChange={handleChange}
              onEnChange={handleChange}
              arName="intro_title"
              enName="intro_title_en"
            />
            <BiField
              label="الوصف"
              arValue={form?.intro_description || ""}
              enValue={form?.intro_description_en || ""}
              onArChange={handleChange}
              onEnChange={handleChange}
              arName="intro_description"
              enName="intro_description_en"
              multiline
            />
          </Section>

          {/* ── Stats ── */}
          <Section icon={Package} title="الإحصائيات">
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-light-gray/10">
              <Field
                label="قيمة المنتجات (مشتركة)"
                name="products_stat"
                value={form?.products_stat || ""}
                onChange={handleChange}
                dir="ltr"
              />
              <Field
                label="قيمة العملاء (مشتركة)"
                name="clients_stat"
                value={form?.clients_stat || ""}
                onChange={handleChange}
                dir="ltr"
              />
            </div>
            <BiField
              label="وصف المنتجات"
              arValue={form?.products_stat_description || ""}
              enValue={form?.products_stat_description_en || ""}
              onArChange={handleChange}
              onEnChange={handleChange}
              arName="products_stat_description"
              enName="products_stat_description_en"
            />
            <BiField
              label="وصف العملاء"
              arValue={form?.clients_stat_description || ""}
              enValue={form?.clients_stat_description_en || ""}
              onArChange={handleChange}
              onEnChange={handleChange}
              arName="clients_stat_description"
              enName="clients_stat_description_en"
            />
          </Section>

          {/* ── Vision & Mission ── */}
          <Section icon={Target} title="الرؤية والرسالة">
            <p className="text-xs font-semibold text-dark-gray mb-1">
              🎯 الرؤية
            </p>
            <BiField
              label="العنوان"
              arValue={form?.vision_title || ""}
              enValue={form?.vision_title_en || ""}
              onArChange={handleChange}
              onEnChange={handleChange}
              arName="vision_title"
              enName="vision_title_en"
            />
            <BiField
              label="الوصف"
              arValue={form?.vision_description || ""}
              enValue={form?.vision_description_en || ""}
              onArChange={handleChange}
              onEnChange={handleChange}
              arName="vision_description"
              enName="vision_description_en"
              multiline
            />

            <p className="text-xs font-semibold text-dark-gray mt-4 mb-1">
              📋 الرسالة
            </p>
            <BiField
              label="العنوان"
              arValue={form?.mission_title || ""}
              enValue={form?.mission_title_en || ""}
              onArChange={handleChange}
              onEnChange={handleChange}
              arName="mission_title"
              enName="mission_title_en"
            />
            <BiField
              label="الوصف"
              arValue={form?.mission_description || ""}
              enValue={form?.mission_description_en || ""}
              onArChange={handleChange}
              onEnChange={handleChange}
              arName="mission_description"
              enName="mission_description_en"
              multiline
            />

            <div className="pt-2 border-t border-light-gray/10 mt-2">
              <ImageField
                label="صورة المتجر (مشتركة)"
                currentImage={data?.store_image_url}
                previewUrl={sharedImages.store_image_preview}
                onFileChange={(e) => handleFileChange(e, "store_image")}
              />
            </div>
          </Section>
        </div>
      ) : (
        /* ════════════════════════════ VIEW MODE ════════════════════════════ */
        <div className="space-y-6" dir={tab === "en" ? "ltr" : "rtl"}>
          {/* ── Main Info ── */}
          <Section
            icon={ImageIcon}
            title={tab === "ar" ? "المعلومات الرئيسية" : "Main Info"}
          >
            <div>
              <p className="text-xs font-semibold text-light-gray uppercase mb-1">
                {tab === "ar" ? "العنوان" : "Title"}
              </p>
              <p className="text-lg font-bold text-text-black">
                {tab === "ar" ? data?.title : data?.title_en}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-light-gray uppercase mb-1">
                {tab === "ar" ? "الوصف" : "Description"}
              </p>
              <p className="text-sm text-dark-gray leading-relaxed whitespace-pre-line">
                {tab === "ar" ? data?.description : data?.description_en}
              </p>
            </div>
            {data?.image_url && (
              <div>
                <p className="text-xs font-semibold text-light-gray uppercase mb-2">
                  {tab === "ar" ? "الصورة الرئيسية" : "Main Image"}
                </p>
                <img
                  src={data.image_url}
                  alt="About"
                  className="h-40 object-contain rounded-lg border border-light-gray/10 bg-light-beige/50 p-2"
                />
              </div>
            )}
          </Section>

          {/* ── Intro ── */}
          <Section icon={Eye} title={tab === "ar" ? "المقدمة" : "Intro"}>
            <p className="font-semibold text-text-black">
              {tab === "ar" ? data?.intro_title : data?.intro_title_en}
            </p>
            <p className="text-sm text-dark-gray leading-relaxed whitespace-pre-line">
              {tab === "ar" ? data?.intro_description : data?.intro_description_en}
            </p>
          </Section>

          {/* ── Stats ── */}
          <Section
            icon={Package}
            title={tab === "ar" ? "الإحصائيات" : "Stats"}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                icon={Package}
                value={data?.products_stat}
                description={
                  tab === "ar"
                    ? data?.products_stat_description
                    : data?.products_stat_description_en
                }
              />
              <StatCard
                icon={Users}
                value={data?.clients_stat}
                description={
                  tab === "ar"
                    ? data?.clients_stat_description
                    : data?.clients_stat_description_en
                }
              />
            </div>
          </Section>

          {/* ── Vision & Mission ── */}
          <Section
            icon={Target}
            title={tab === "ar" ? "رؤيتنا ورسالتنا" : "Vision & Mission"}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <h3 className="font-semibold text-text-black">
                    {tab === "ar" ? data?.vision_title : data?.vision_title_en}
                  </h3>
                </div>
                <p className="text-sm text-dark-gray leading-relaxed">
                  {tab === "ar"
                    ? data?.vision_description
                    : data?.vision_description_en}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  <h3 className="font-semibold text-text-black">
                    {tab === "ar" ? data?.mission_title : data?.mission_title_en}
                  </h3>
                </div>
                <p className="text-sm text-dark-gray leading-relaxed">
                  {tab === "ar"
                    ? data?.mission_description
                    : data?.mission_description_en}
                </p>
              </div>
            </div>
            {data?.store_image_url && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-light-gray uppercase mb-2">
                  {tab === "ar" ? "صورة المتجر" : "Store Image"}
                </p>
                <img
                  src={data.store_image_url}
                  alt="Store"
                  className="h-40 object-contain rounded-lg border border-light-gray/10 bg-light-beige/50 p-2"
                />
              </div>
            )}
          </Section>
        </div>
      )}
    </div>
  );
};

export default AboutAs;
