import { memo } from "react";
import { X, Plus, Palette, Ruler } from "lucide-react";
import { Controller } from "react-hook-form";
import { Chip } from "./DetailsTab";

const inputCls = () =>
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary bg-white transition-colors hover:border-gray-300";

const SectionLabel = ({ label, icon: Icon = Palette }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="p-1.5 bg-secondary/5 rounded-lg">
      <Icon size={14} className="text-secondary" />
    </div>
    <span className="text-sm font-semibold text-gray-700">{label}</span>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

const Label = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
    {children}
  </label>
);

/**
 * VariantsTab — colors and sizes management
 */
const VariantsTab = memo(({
  control,
  colorFields, newColorName, newColorHex, newColorImagePreview,
  onNewColorName, onNewColorHex, onNewColorImage, onAddColor, onRemoveColor,
  sizeFields, newSizeName, newSizeDim,
  onNewSizeName, onNewSizeDim, onAddSize, onRemoveSize,
}) => (
  <>
    {/* Colors */}
    <div>
      <SectionLabel label="الألوان" icon={Palette} />
      <div className="flex gap-2 mb-3 items-center flex-wrap">
        <input
          value={newColorName}
          onChange={(e) => onNewColorName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAddColor(); } }}
          className={inputCls() + " flex-1 text-black min-w-[200px]"}
          placeholder="اسم اللون (مثال: بني غامق)"
        />
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={newColorHex}
            onChange={(e) => onNewColorHex(e.target.value)}
            className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5 text-black shrink-0"
          />
          <span className="text-xs text-gray-400 w-16 shrink-0">{newColorHex}</span>
        </div>
        
        <div className="relative shrink-0">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onNewColorImage(e.target.files[0] || null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="اختر صورة للون"
          />
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center overflow-hidden transition-colors ${newColorImagePreview ? 'border-secondary' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
            {newColorImagePreview ? (
              <img src={newColorImagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onAddColor}
          className="px-4 py-2.5 bg-secondary text-white rounded-xl hover:opacity-90 transition-colors shrink-0"
        >
          <Plus size={18} />
        </button>
      </div>
      {colorFields.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {colorFields.map((field, i) => (
            <Controller
              key={field.id}
              control={control}
              name={`colors.${i}`}
              render={({ field: f }) => {
                const imgUrl = f.value.image_path instanceof File 
                  ? URL.createObjectURL(f.value.image_path) 
                  : f.value.image_path;
                return (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full text-sm bg-white shadow-sm">
                    {imgUrl && (
                      <img src={imgUrl} alt={f.value.name} className="w-5 h-5 rounded-full object-cover border border-gray-200" />
                    )}
                    <span
                      className="w-4 h-4 rounded-full border border-gray-200 shadow-inner"
                      style={{ backgroundColor: f.value.hex_code }}
                    />
                    {f.value.name}
                    <button
                      type="button"
                      onClick={() => onRemoveColor(i)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              }}
            />
          ))}
        </div>
      )}
    </div>

    {/* Sizes */}
    <div>
      <SectionLabel label="الأحجام" icon={Ruler} />
      <div className="flex gap-2 mb-3 items-end">
        <div className="flex-1">
          <Label>اسم المقاس</Label>
          <input
            value={newSizeName}
            onChange={(e) => onNewSizeName(e.target.value)}
            className={inputCls() + " text-black text-xs px-2 py-1.5"}
            placeholder="مثال: كبير"
          />
        </div>
        <div className="flex-1">
          <Label>الأبعاد</Label>
          <input
            value={newSizeDim}
            onChange={(e) => onNewSizeDim(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAddSize(); } }}
            className={inputCls() + " text-black text-xs px-2 py-1.5"}
            placeholder="مثال: 50x50"
          />
        </div>
        <button
          type="button"
          onClick={onAddSize}
          className="px-4 py-2.5 h-[34px] bg-secondary text-white rounded-xl hover:opacity-90 transition-colors shrink-0"
        >
          <Plus size={18} />
        </button>
      </div>
      {sizeFields.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sizeFields.map((field, i) => (
            <Controller
              key={field.id}
              control={control}
              name={`sizes.${i}`}
              render={({ field: f }) => (
                <Chip color="gray" onRemove={() => onRemoveSize(i)}>
                  {f.value.size_name}
                  {f.value.dimensions ? ` (${f.value.dimensions})` : ""}
                </Chip>
              )}
            />
          ))}
        </div>
      )}
    </div>
  </>
));

VariantsTab.displayName = "VariantsTab";
export default VariantsTab;
