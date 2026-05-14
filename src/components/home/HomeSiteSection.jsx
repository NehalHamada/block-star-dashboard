import { LayoutList, Save, Edit3, X, Loader2 } from "lucide-react";
import { SectionCard, Field, DisplayValue, ImageField, Toast } from "./HomeUI";

/**
 * HomeSiteSection
 * The "Home Section" card — title (AR/EN), description (AR/EN),
 * buttons list, and one image. Has its own independent edit/save/cancel controls.
 */
const HomeSiteSection = ({
  sectionData,
  sectionForm,
  sectionEditing,
  sectionSaving,
  sectionSuccess,
  sectionError,
  sectionImagePreview,
  onChange,
  onButtonChange,
  onImageChange,
  onSave,
  onCancel,
  onEdit,
  onCloseSuccess,
  onCloseError,
}) => {
  if (!sectionData) return null;

  return (
    <SectionCard icon={LayoutList} title="قسم الصفحة الرئيسية (Home Section)">
      {/* Toasts */}
      {sectionSuccess && (
        <Toast
          type="success"
          message="تم حفظ التغييرات بنجاح ✅"
          onClose={onCloseSuccess}
        />
      )}
      {sectionError && (
        <Toast type="error" message={sectionError} onClose={onCloseError} />
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-end mb-5">
        <div className="flex items-center gap-2">
          {sectionEditing ? (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all duration-200"
              >
                <X size={14} /> إلغاء
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={sectionSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary text-white text-sm font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-60 shadow-sm shadow-secondary/20"
              >
                {sectionSaving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {sectionSaving ? "جارٍ الحفظ..." : "حفظ"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary text-white text-sm font-medium hover:opacity-90 transition-all duration-200 shadow-sm shadow-secondary/20"
            >
              <Edit3 size={14} /> تعديل
            </button>
          )}
        </div>
      </div>

      {sectionEditing ? (
        <div className="space-y-6">
          {/* Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field
              label="العنوان (عربي)"
              name="title_ar"
              value={sectionForm?.title_ar}
              onChange={onChange}
              dir="rtl"
            />
            <Field
              label="Title (EN)"
              name="title_en"
              value={sectionForm?.title_en}
              onChange={onChange}
              dir="ltr"
            />
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field
              label="الوصف (عربي)"
              name="description_ar"
              value={sectionForm?.description_ar}
              onChange={onChange}
              multiline
              dir="rtl"
            />
            <Field
              label="Description (EN)"
              name="description_en"
              value={sectionForm?.description_en}
              onChange={onChange}
              multiline
              dir="ltr"
            />
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 tracking-wide">الأزرار</p>
            {(sectionForm?.buttons ?? []).map((btn, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <Field
                  label={`زر ${i + 1} — عربي`}
                  value={btn.text_ar}
                  onChange={(e) => onButtonChange(i, "text_ar", e.target.value)}
                  dir="rtl"
                />
                <Field
                  label={`Button ${i + 1} — EN`}
                  value={btn.text_en}
                  onChange={(e) => onButtonChange(i, "text_en", e.target.value)}
                  dir="ltr"
                />
              </div>
            ))}
          </div>

          {/* Image */}
          <ImageField
            label="صورة القسم"
            currentImage={sectionData?.images?.[0]?.url}
            previewUrl={sectionImagePreview}
            onFileChange={onImageChange}
          />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <DisplayValue label="العنوان (AR)" value={sectionData?.title_ar} large />
              <DisplayValue label="Title (EN)" value={sectionData?.title_en} large />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <DisplayValue label="الوصف (AR)" value={sectionData?.description_ar} />
              <DisplayValue label="Description (EN)" value={sectionData?.description_en} />
            </div>
            {(sectionData?.buttons ?? []).length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  الأزرار
                </p>
                <div className="flex flex-wrap gap-2">
                  {sectionData.buttons.map((btn, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-secondary text-xs font-medium rounded-lg"
                    >
                      <span dir="rtl">{btn.text_ar}</span>
                      <span className="text-gray-300">|</span>
                      <span dir="ltr">{btn.text_en}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {sectionData?.images?.[0]?.url && (
            <div className="flex-shrink-0">
              <img
                src={sectionData.images[0].url}
                alt="Section Image"
                className="h-40 w-auto object-cover rounded-xl border border-gray-100 shadow-sm"
              />
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
};

export default HomeSiteSection;
