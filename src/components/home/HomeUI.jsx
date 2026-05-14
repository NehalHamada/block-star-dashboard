/**
 * HomeUI.jsx
 * Shared primitive UI components used across all Home page sections.
 */
import {
  Globe,
  Upload,
  Image as ImageIcon,
  FileVideo,
  ChevronDown,
  Check,
  AlertCircle,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "../../utils/cn";

// ── Language Tab Switcher ─────────────────────────────────────────────────────
export const LangTabs = ({ activeLang, onChange }) => (
  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
    {[
      { key: "ar", label: "عربي" },
      { key: "en", label: "English" },
    ].map(({ key, label }) => (
      <button
        key={key}
        type="button"
        onClick={() => onChange(key)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
          activeLang === key
            ? "bg-white text-secondary shadow-sm"
            : "text-gray-500 hover:text-gray-700",
        )}
      >
        <Globe size={12} />
        {label}
      </button>
    ))}
  </div>
);

// ── Field Input ───────────────────────────────────────────────────────────────
export const Field = ({ label, value, name, onChange, multiline = false, dir }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-500 tracking-wide">
      {label}
    </label>
    {multiline ? (
      <textarea
        name={name}
        value={value ?? ""}
        onChange={onChange}
        dir={dir}
        rows={4}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary resize-none bg-white transition-all duration-200"
      />
    ) : (
      <input
        name={name}
        value={value ?? ""}
        onChange={onChange}
        dir={dir}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary bg-white transition-all duration-200"
      />
    )}
  </div>
);

// ── Display Value (View Mode) ─────────────────────────────────────────────────
export const DisplayValue = ({ label, value, large = false }) => (
  <div>
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
      {label}
    </p>
    <p
      className={cn(
        "text-gray-700 leading-relaxed",
        large ? "text-lg font-bold" : "text-sm",
      )}
    >
      {value || "—"}
    </p>
  </div>
);

// ── Image Upload Field ────────────────────────────────────────────────────────
export const ImageField = ({ label, currentImage, onFileChange, previewUrl }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-semibold text-gray-500 tracking-wide">
      {label}
    </label>
    <div className="relative group w-fit">
      {previewUrl || currentImage ? (
        <img
          src={previewUrl || currentImage}
          alt="Preview"
          className="h-40 w-40 object-cover rounded-xl border-2 border-dashed border-gray-200 p-1 transition-transform duration-200 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="h-40 w-40 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50/50">
          <div className="flex flex-col items-center gap-2 text-gray-300">
            <Upload size={24} />
            <span className="text-[10px]">رفع صورة</span>
          </div>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center pointer-events-none">
        <ImageIcon className="text-white" size={24} />
      </div>
    </div>
    <p className="text-[10px] text-gray-400">اضغط لتغيير الصورة (PNG, JPG)</p>
  </div>
);

// ── Video Upload Field ────────────────────────────────────────────────────────
export const VideoField = ({ videoUrl, videoFile, videoPreview, onFileChange }) => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <div className="flex items-center gap-2.5 px-5 py-3 border-2 border-dashed border-secondary/40 rounded-xl text-secondary text-sm hover:bg-secondary/5 hover:border-secondary transition-all duration-200">
          <FileVideo size={18} />
          {videoFile ? videoFile.name : "اختر ملف فيديو"}
        </div>
        <input
          type="file"
          accept="video/*"
          onChange={onFileChange}
          className="hidden"
        />
      </label>
      {videoFile && (
        <p className="text-[10px] text-gray-400 mr-1">
          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
        </p>
      )}
    </div>
    {(videoPreview || (!videoFile && videoUrl)) && (
      <video
        src={videoPreview || videoUrl}
        controls
        className="w-full max-w-md rounded-xl border border-gray-200 mt-1 shadow-sm"
        style={{ maxHeight: 220 }}
      />
    )}
  </div>
);

// ── Collapsible Section Card ─────────────────────────────────────────────────
export const SectionCard = ({ icon: Icon, title, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md">
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="flex items-center justify-between w-full px-6 py-4 bg-gradient-to-l from-gray-50 to-white cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
            <Icon size={16} className="text-secondary" />
          </div>
          <h2 className="text-sm font-bold text-gray-700">{title}</h2>
        </div>
        <ChevronDown
          size={18}
          className={cn(
            "text-gray-400 transition-transform duration-300",
            isOpen ? "rotate-180" : "",
          )}
        />
      </button>
      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="p-6 border-t border-gray-50">{children}</div>
      </div>
    </div>
  );
};

// ── Toast Notification ────────────────────────────────────────────────────────
export const Toast = ({ type, message, onClose }) => (
  <div
    className={cn(
      "flex items-center gap-3 p-4 rounded-xl text-sm font-medium border animate-[fadeIn_0.3s_ease-out]",
      type === "success"
        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
        : "bg-red-50 border-red-200 text-red-600",
    )}
  >
    {type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
    <span className="flex-1">{message}</span>
    {onClose && (
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X size={14} />
      </button>
    )}
  </div>
);
