import { memo } from "react";
import { X, Plus, Upload, FileVideo, Image, Layers } from "lucide-react";

// ── Shared helpers ────────────────────────────────────────────────────────────
const SectionLabel = ({ label }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="p-1.5 bg-secondary/5 rounded-lg">
      <Layers size={14} className="text-secondary" />
    </div>
    <span className="text-sm font-semibold text-gray-700">{label}</span>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

// ── Image grid upload ─────────────────────────────────────────────────────────
const ImageGrid = memo(({ previews, onAdd, onRemove, label, multiple = true, accent = "amber" }) => {
  const ring =
    accent === "blue"
      ? "border-blue-300 hover:border-blue-500 text-blue-400"
      : "border-secondary/30 hover:border-secondary text-secondary";
  return (
    <div className="flex flex-wrap gap-2">
      {previews.map((src, i) => (
        <div key={i} className="relative w-20 h-20 group">
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover rounded-xl border border-gray-100 shadow-sm"
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
          >
            <X size={11} />
          </button>
        </div>
      ))}
      <label className={`w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-colors ${ring}`}>
        <Plus size={18} />
        <span className="text-[10px] mt-0.5 font-medium">{label}</span>
        <input type="file" accept="image/*" multiple={multiple} className="sr-only" onChange={onAdd} />
      </label>
    </div>
  );
});

/**
 * MediaTab — main image, gallery, usage ideas, video upload
 */
const MediaTab = memo(({
  mainPreview, onMainImageChange, onClearMain,
  extraPreviews, onExtraImages, onRemoveExtra,
  usageIdeaPreviews, onUsageIdeas, onRemoveUsage,
  video, onVideoChange, onClearVideo,
}) => (
  <>
    {/* Main Image */}
    <div>
      <SectionLabel label="الصورة الرئيسية" />
      {mainPreview ? (
        <div className="relative inline-block">
          <img
            src={mainPreview}
            alt="Preview"
            className="h-40 w-full object-contain rounded-xl border border-gray-100"
          />
          <button
            type="button"
            onClick={onClearMain}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-secondary/20 rounded-xl cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-colors text-gray-400">
          <Upload size={28} className="mb-2 text-secondary" />
          <span className="text-sm text-secondary font-medium">اضغط لرفع الصورة الرئيسية</span>
          <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP</span>
          <input type="file" accept="image/*" className="sr-only" onChange={onMainImageChange} />
        </label>
      )}
    </div>

    {/* Gallery */}
    <div>
      <SectionLabel label="صور إضافية (معرض)" />
      <ImageGrid
        previews={extraPreviews}
        onAdd={onExtraImages}
        onRemove={onRemoveExtra}
        label="إضافة"
      />
    </div>

    {/* Usage idea images */}
    <div>
      <SectionLabel label="صور أفكار الاستخدام" />
      <ImageGrid
        previews={usageIdeaPreviews}
        onAdd={onUsageIdeas}
        onRemove={onRemoveUsage}
        label="إضافة"
        accent="blue"
      />
    </div>

    {/* Video */}
    <div>
      <SectionLabel label="فيديو المنتج" />
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-colors text-sm text-gray-600">
          <Upload size={15} className="text-secondary" />
          {video ? (
            <span className="text-secondary font-medium max-w-[200px] truncate">
              {video instanceof File ? video.name : video.split("/").pop()}
            </span>
          ) : (
            "اختر فيديو (اختياري)"
          )}
          <input
            type="file"
            accept="video/*"
            className="sr-only"
            onChange={onVideoChange}
          />
        </label>
        {video && (
          <button
            type="button"
            onClick={onClearVideo}
            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  </>
));

MediaTab.displayName = "MediaTab";
export { ImageGrid };
export default MediaTab;
