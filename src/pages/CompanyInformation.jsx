import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Loader, FileText } from "lucide-react";
import partnersService from "../services/partnersService";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/common/Card";
import Button from "../components/common/Button";

const inputCls =
  "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary";

export default function CompanyInformation() {
  const [form, setForm] = useState({
    title_ar: "",
    title_en: "",
    description_ar: "",
    description_en: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const res = await partnersService.getPageContent();
        const data = res.data || res;
        setForm({
          title_ar: data.title_ar || "",
          title_en: data.title_en || "",
          description_ar: data.description_ar || "",
          description_en: data.description_en || "",
        });
      } catch {
        toast.error("فشل تحميل بيانات صفحة الشركات");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await partnersService.updatePageContent(form);
      toast.success("تم تحديث محتوى صفحة الشركات بنجاح");
    } catch (err) {
      toast.error(err?.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader className="animate-spin h-8 w-8 text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="text-secondary" size={28} />
        <h1 className="text-2xl font-semibold text-gray-900">
          محتوى صفحة الشركات
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تعديل العنوان والوصف</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Arabic Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b pb-2">
                العربية
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  العنوان (عربي) <span className="text-red-500">*</span>
                </label>
                <input
                  name="title_ar"
                  value={form.title_ar}
                  onChange={handleChange}
                  className={inputCls}
                  dir="rtl"
                  placeholder="عنوان صفحة الشركاء بالعربية"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوصف (عربي)
                </label>
                <textarea
                  name="description_ar"
                  value={form.description_ar}
                  onChange={handleChange}
                  rows={4}
                  className={inputCls}
                  dir="rtl"
                  placeholder="وصف صفحة الشركاء بالعربية..."
                />
              </div>
            </div>

            {/* English Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b pb-2">
                English
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (English) <span className="text-red-500">*</span>
                </label>
                <input
                  name="title_en"
                  value={form.title_en}
                  onChange={handleChange}
                  className={inputCls}
                  dir="ltr"
                  placeholder="Partners page title in English"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (English)
                </label>
                <textarea
                  name="description_en"
                  value={form.description_en}
                  onChange={handleChange}
                  rows={4}
                  className={inputCls}
                  dir="ltr"
                  placeholder="Partners page description in English..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? (
                  <>
                    <Loader size={16} className="animate-spin ml-2" />
                    جارٍ الحفظ...
                  </>
                ) : (
                  "حفظ التغييرات"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
