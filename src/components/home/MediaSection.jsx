import { Layers, Upload, PlusCircle, X, Trash2 } from "lucide-react";
import { SectionCard } from "./HomeUI";

/**
 * MediaSection
 * Displays the media[] array as a thumbnail grid.
 * - In edit mode each existing slot shows an "استبدال" overlay on hover.
 * - In edit mode each existing slot shows a delete (trash) button on hover.
 * - In edit mode an "إضافة وسيط" button lets the user add brand-new items.
 */
const MediaSection = ({
  editing,
  data,
  mediaFiles,
  mediaPreviews,
  onMediaFileChange,
  newMediaFiles,
  newMediaPreviews,
  onAddMedia,
  onRemoveNewMedia,
  onDeleteMedia,
}) => (
  <SectionCard icon={Layers} title="الوسائط (Media)">
    <div className="space-y-6">
      {/* ── Existing media items ── */}
      {(data?.media ?? []).length === 0 && (newMediaFiles ?? []).length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">لا توجد وسائط</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* Existing slots */}
          {(data?.media ?? []).map((item, index) => {
            const isVideo = item.type === "video";
            const previewSrc = mediaPreviews[index];

            return (
              <div key={`existing-${index}`} className="flex flex-col gap-2">
                <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video flex items-center justify-center">
                  {previewSrc ? (
                    isVideo || mediaFiles[index]?.type?.startsWith("video") ? (
                      <video src={previewSrc} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={previewSrc} alt={`media-${index}`} className="w-full h-full object-cover" />
                    )
                  ) : isVideo ? (
                    <video src={item.url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={item.url} alt={`media-${index}`} className="w-full h-full object-cover" />
                  )}

                  {/* Type badge */}
                  <span
                    className={`absolute top-1.5 right-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                      isVideo ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {isVideo ? "video" : "image"}
                  </span>

                  {/* Replace overlay (edit mode only) */}
                  {editing && (
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center cursor-pointer gap-1">
                      <Upload size={20} className="text-white" />
                      <span className="text-white text-[10px] font-medium">
                        {mediaFiles[index] ? mediaFiles[index].name : "استبدال"}
                      </span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => onMediaFileChange(e, index)}
                      />
                    </label>
                  )}

                  {/* Delete button (edit mode only) */}
                  {editing && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("هل أنت متأكد من حذف هذا الوسيط؟")) {
                          onDeleteMedia(index);
                        }
                      }}
                      className="absolute bottom-1.5 left-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
                      title="حذف"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
                {mediaFiles[index] && (
                  <p className="text-[10px] text-emerald-600 font-medium truncate">
                    ✓ {mediaFiles[index].name}
                  </p>
                )}
              </div>
            );
          })}

          {/* New items added in this session */}
          {(newMediaFiles ?? []).map((file, i) => {
            const previewSrc = newMediaPreviews?.[i];
            const isVideo = file?.type?.startsWith("video");

            return (
              <div key={`new-${i}`} className="flex flex-col gap-2">
                <div className="relative group rounded-xl overflow-hidden border-2 border-dashed border-secondary/40 bg-secondary/5 aspect-video flex items-center justify-center">
                  {previewSrc ? (
                    isVideo ? (
                      <video src={previewSrc} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={previewSrc} alt={`new-media-${i}`} className="w-full h-full object-cover" />
                    )
                  ) : null}

                  {/* "New" badge */}
                  <span className="absolute top-1.5 right-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                    جديد
                  </span>

                  {/* Remove button */}
                  {editing && (
                    <button
                      type="button"
                      onClick={() => onRemoveNewMedia(i)}
                      className="absolute top-1.5 left-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-emerald-600 font-medium truncate">
                  ✓ {file?.name}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add new media button (edit mode only) ── */}
      {editing && (
        <label className="flex items-center gap-2.5 w-fit px-4 py-2.5 border-2 border-dashed border-secondary/40 rounded-xl text-secondary text-sm font-medium hover:bg-secondary/5 hover:border-secondary transition-all duration-200 cursor-pointer">
          <PlusCircle size={18} />
          إضافة وسيط جديد
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={onAddMedia}
          />
        </label>
      )}
    </div>
  </SectionCard>
);

export default MediaSection;
