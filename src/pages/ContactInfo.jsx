import { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  Link2,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Instagram,
  Facebook,
  Youtube,
  Globe,
} from "lucide-react";
import contactInfoService from "../services/contactInfoService";

// ── Map social name → icon ──────────────────────────────────────────────
const SocialIcon = ({ name, size = 16 }) => {
  const n = (name || "").toLowerCase();
  if (n.includes("instagram"))
    return <Instagram size={size} className="text-pink-500" />;
  if (n.includes("facebook"))
    return <Facebook size={size} className="text-blue-600" />;
  if (n.includes("youtube"))
    return <Youtube size={size} className="text-red-500" />;
  if (n.includes("whatsapp"))
    return <Phone size={size} className="text-green-500" />;
  if (n.includes("tiktok"))
    return <Globe size={size} className="text-text-black" />;
  return <Globe size={size} className="text-light-gray" />;
};

// ── Section card ────────────────────────────────────────────────────────
const Section = (props) => {
  const { icon: Icon, title, children } = props;

  return (
    <div className="bg-white rounded-xl border border-light-gray/10 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-light-gray/10 bg-light-beige/30">
        <Icon size={18} className="text-secondary" />
        <h2 className="text-sm font-semibold text-text-black">{title}</h2>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
};
// ── Field ───────────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, type = "text", placeholder = "" }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-dark-gray uppercase tracking-wide">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-light-gray/20 rounded-lg text-sm text-text-black focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-white"
    />
  </div>
);

// ════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════════
const ContactInfo = () => {
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await contactInfoService.get();
        setData(res.data);
        setForm(res.data);
      } catch (err) {
        setError(err.message || "حدث خطأ أثناء جلب البيانات");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await contactInfoService.update(form);
      setData(form);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err.errors) {
        setError(Object.values(err.errors)[0][0]);
      } else {
        setError(err.message || "فشل حفظ التغييرات، حاول مرة أخرى");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(data);
    setEditing(false);
    setError(null);
  };

  // ── Phones helpers ────────────────────────────────────────────────────
  const updatePhone = (i, val) =>
    setForm((prev) => {
      const phones = [...prev.phones];
      phones[i] = val;
      return { ...prev, phones };
    });

  const addPhone = () =>
    setForm((prev) => ({ ...prev, phones: [...prev.phones, ""] }));

  const removePhone = (i) =>
    setForm((prev) => ({
      ...prev,
      phones: prev.phones.filter((_, idx) => idx !== i),
    }));

  // ── Social links helpers ──────────────────────────────────────────────
  const updateSocial = (i, field, val) =>
    setForm((prev) => {
      const social_links = [...prev.social_links];
      social_links[i] = { ...social_links[i], [field]: val };
      return { ...prev, social_links };
    });

  const addSocial = () =>
    setForm((prev) => ({
      ...prev,
      social_links: [...prev.social_links, { name: "", url: "" }],
    }));

  const removeSocial = (i) =>
    setForm((prev) => ({
      ...prev,
      social_links: prev.social_links.filter((_, idx) => idx !== i),
    }));

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-light-gray/10 rounded-lg animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 bg-light-gray/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-black">
            بيانات التواصل
          </h1>
          <p className="text-sm text-dark-gray mt-0.5">
            إدارة معلومات التواصل وروابط التواصل الاجتماعي
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

      {/* ── Alerts ── */}
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

      {/* ── Basic Info ── */}
      <Section icon={Mail} title="المعلومات الأساسية">
        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="عنوان الصفحة"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
            />
            <Field
              label="البريد الإلكتروني"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-dark-gray uppercase mb-1">
                عنوان الصفحة
              </p>
              <p className="text-base font-semibold text-text-black">
                {data.title}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-dark-gray uppercase mb-1">
                البريد الإلكتروني
              </p>
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-secondary" />
                <a
                  href={`mailto:${data.email}`}
                  className="text-sm text-secondary hover:underline"
                  dir="ltr"
                >
                  {data.email}
                </a>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ── Phones ── */}
      <Section icon={Phone} title="أرقام الهاتف">
        {editing ? (
          <div className="space-y-3">
            {form.phones.map((phone, i) => (
              <div key={i} className="flex items-center gap-2">
                <Phone size={15} className="text-dark-gray flex-shrink-0" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => updatePhone(i, e.target.value)}
                  placeholder="+20..."
                  dir="ltr"
                  className="flex-1 px-3 py-2 border border-light-gray/20 rounded-lg text-sm text-text-black focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
                <button
                  onClick={() => removePhone(i)}
                  disabled={form.phones.length === 1}
                  className="p-1.5 rounded-lg text-dark-gray hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button
              onClick={addPhone}
              className="flex items-center gap-1.5 text-sm text-secondary hover:underline font-medium mt-1"
            >
              <Plus size={15} />
              إضافة رقم
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {data.phones.map((phone, i) => (
              <a
                key={i}
                href={`tel:${phone}`}
                dir="ltr"
                className="flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-xl text-sm text-secondary font-medium hover:bg-secondary/15 transition-colors"
              >
                <Phone size={14} className="text-secondary" />
                {phone}
              </a>
            ))}
          </div>
        )}
      </Section>

      {/* ── Social Links ── */}
      <Section icon={Link2} title="روابط التواصل الاجتماعي">
        {editing ? (
          <div className="space-y-4">
            {form.social_links.map((link, i) => (
              <div
                key={link.id ?? i}
                className="grid grid-cols-1 sm:grid-cols-[160px_1fr_auto] gap-2 items-center p-3 border border-light-gray/10 rounded-xl bg-light-gray/5"
              >
                <input
                  value={link.name}
                  onChange={(e) => updateSocial(i, "name", e.target.value)}
                  placeholder="اسم المنصة"
                  className="text-text-black px-3 py-2 border border-light-gray/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-white"
                />
                <input
                  value={link.url}
                  onChange={(e) => updateSocial(i, "url", e.target.value)}
                  placeholder="https://..."
                  dir="ltr"
                  className="text-text-black px-3 py-2 border border-light-gray/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-white"
                />
                <button
                  onClick={() => removeSocial(i)}
                  className="p-1.5 rounded-lg text-dark-gray hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button
              onClick={addSocial}
              className="flex items-center gap-1.5 text-sm text-secondary hover:underline font-medium"
            >
              <Plus size={15} />
              إضافة رابط
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.social_links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-4 py-3 bg-light-gray/5 border border-light-gray/10 rounded-xl hover:border-secondary/20 hover:bg-secondary/5 transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-light-gray/10">
                  <SocialIcon name={link.name} size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-black">
                    {link.name}
                  </p>
                  <p
                    className="text-xs text-dark-gray truncate group-hover:text-secondary transition-colors"
                    dir="ltr"
                  >
                    {link.url}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};

export default ContactInfo;
