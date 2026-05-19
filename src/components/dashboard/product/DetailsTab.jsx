import { memo } from "react";
import { X, Plus, Layers, FileText } from "lucide-react";
import { Controller } from "react-hook-form";

const inputCls = () =>
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary bg-white transition-colors hover:border-gray-300";

const formatFileUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `https://wooden.ahdafweb.com${cleanUrl}`;
};

const getFileNameFromUrl = (url) => {
  if (!url) return "";
  const parts = url.split("/");
  return parts[parts.length - 1] || "catalog.pdf";
};

const SectionLabel = ({ label }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="p-1.5 bg-secondary/5 rounded-lg">
      <Layers size={14} className="text-secondary" />
    </div>
    <span className="text-sm font-semibold text-gray-700">{label}</span>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

const Chip = ({ children, onRemove, color = "amber" }) => {
  const cls =
    color === "gray"
      ? "bg-gray-100 text-gray-700 border-gray-200"
      : "bg-secondary/5 text-secondary border-secondary/20";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 border rounded-full text-xs font-medium ${cls}`}>
      {children}
      <button type="button" onClick={onRemove} className="ml-0.5 opacity-60 hover:opacity-100">
        <X size={10} />
      </button>
    </span>
  );
};

// ── Feature list builder ──────────────────────────────────────────────────────
const FeatureList = memo(({ fields, control, name, newVal, onNewVal, onAdd, onRemove, placeholder, dir }) => (
  <div dir={dir}>
    <div className="flex gap-2 mb-3">
      <input
        value={newVal}
        onChange={(e) => onNewVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
        className={inputCls() + " flex-1"}
        placeholder={placeholder}
      />
      <button type="button" onClick={onAdd} className="px-3 py-2 bg-secondary text-white rounded-xl">
        <Plus size={16} />
      </button>
    </div>
    {fields.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {fields.map((field, i) => (
          <Controller
            key={field.id}
            control={control}
            name={`${name}.${i}`}
            render={({ field: f }) => (
              <Chip onRemove={() => onRemove(i)}>{f.value}</Chip>
            )}
          />
        ))}
      </div>
    )}
  </div>
));

// ── Specification list builder ────────────────────────────────────────────────
const SpecList = memo(({ fields, control, name, newKey, newVal, onNewKey, onNewVal, onAdd, onRemove, placeholderKey, placeholderVal, dir }) => (
  <div dir={dir}>
    <div className="flex flex-col gap-2 mb-3">
      <div className="flex gap-2">
        <input
          value={newKey}
          onChange={(e) => onNewKey(e.target.value)}
          className={inputCls() + " flex-1 text-black text-xs px-2 py-1.5"}
          placeholder={placeholderKey}
        />
        <input
          value={newVal}
          onChange={(e) => onNewVal(e.target.value)}
          className={inputCls() + " flex-1 text-black text-xs px-2 py-1.5"}
          placeholder={placeholderVal}
        />
        <button type="button" onClick={onAdd} className="px-3 bg-secondary text-white rounded-xl">
          <Plus size={16} />
        </button>
      </div>
    </div>
    {fields.length > 0 && (
      <div className="space-y-1">
        {fields.map((field, i) => (
          <Controller
            key={field.id}
            control={control}
            name={`${name}.${i}`}
            render={({ field: f }) => (
              <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                <span><b>{f.value.key}:</b> {f.value.value}</span>
                <button type="button" onClick={() => onRemove(i)}>
                  <X size={10} className="text-red-400" />
                </button>
              </div>
            )}
          />
        ))}
      </div>
    )}
  </div>
));

/**
 * DetailsTab — features (AR/EN) + specifications (AR/EN)
 */
const DetailsTab = memo(({
  control,
  featureFields, newFeature, onNewFeature, onAddFeature, onRemoveFeat,
  featureEnFields, newFeatureEn, onNewFeatureEn, onAddFeatureEn, onRemoveFeatEn,
  specFields, newSpecKey, newSpecVal, onNewSpecKey, onNewSpecVal, onAddSpec, onRemoveSpec,
  specEnFields, newSpecKeyEn, newSpecValEn, onNewSpecKeyEn, onNewSpecValEn, onAddSpecEn, onRemoveSpecEn,
  pdfFile, currentPdfUrl, onPdfChange, onClearPdf,
}) => (
  <>
    {/* Features */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <SectionLabel label="المميزات (AR)" />
        <FeatureList
          fields={featureFields}
          control={control}
          name="features"
          newVal={newFeature}
          onNewVal={onNewFeature}
          onAdd={onAddFeature}
          onRemove={onRemoveFeat}
          placeholder="أضف ميزة بالعربية"
          dir="rtl"
        />
      </div>
      <div>
        <SectionLabel label="Features (EN)" />
        <FeatureList
          fields={featureEnFields}
          control={control}
          name="features_en"
          newVal={newFeatureEn}
          onNewVal={onNewFeatureEn}
          onAdd={onAddFeatureEn}
          onRemove={onRemoveFeatEn}
          placeholder="Add feature in English"
          dir="ltr"
        />
      </div>
    </div>

    {/* Specifications */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
      <div>
        <SectionLabel label="المواصفات (AR)" />
        <SpecList
          fields={specFields}
          control={control}
          name="specifications"
          newKey={newSpecKey}
          newVal={newSpecVal}
          onNewKey={onNewSpecKey}
          onNewVal={onNewSpecVal}
          onAdd={onAddSpec}
          onRemove={onRemoveSpec}
          placeholderKey="الخاصية"
          placeholderVal="القيمة"
          dir="rtl"
        />
      </div>
      <div>
        <SectionLabel label="Specifications (EN)" />
        <SpecList
          fields={specEnFields}
          control={control}
          name="specifications_en"
          newKey={newSpecKeyEn}
          newVal={newSpecValEn}
          onNewKey={onNewSpecKeyEn}
          onNewVal={onNewSpecValEn}
          onAdd={onAddSpecEn}
          onRemove={onRemoveSpecEn}
          placeholderKey="Key"
          placeholderVal="Value"
          dir="ltr"
        />
      </div>
    </div>

    {/* Catalogue (PDF) */}
    <div className="pt-4 border-t border-gray-100">
      <SectionLabel label="الكاتالوج (PDF)" />
      <div className="mt-2 bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
        {pdfFile || currentPdfUrl ? (
          <div className="flex items-center gap-3 w-full max-w-md bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="p-2 bg-red-50 text-red-500 rounded-lg shrink-0">
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-sm font-semibold text-gray-700 truncate">
                {pdfFile ? pdfFile.name : getFileNameFromUrl(currentPdfUrl)}
              </p>
              <p className="text-xs text-gray-400">
                {pdfFile ? `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB` : "ملف PDF"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {currentPdfUrl && (
                <a
                  href={formatFileUrl(currentPdfUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-secondary hover:underline px-2.5 py-1.5 bg-secondary/5 rounded-lg transition-colors"
                >
                  عرض
                </a>
              )}
              <button
                type="button"
                onClick={onClearPdf}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                title="إزالة الكاتالوج"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center cursor-pointer py-4 w-full">
            <div className="w-12 h-12 rounded-full bg-secondary/5 flex items-center justify-center mb-2.5">
              <FileText className="text-secondary" size={22} />
            </div>
            <span className="text-sm font-semibold text-gray-700">اضغط لرفع ملف الكاتالوج</span>
            <span className="text-xs text-gray-400 mt-1">تنسيق PDF فقط، بحد أقصى 15 ميجابايت</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={onPdfChange}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  </>
));

DetailsTab.displayName = "DetailsTab";
export { Chip };
export default DetailsTab;
