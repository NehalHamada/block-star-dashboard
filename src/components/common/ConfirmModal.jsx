import { memo } from "react";
import { Trash2 } from "lucide-react";

/**
 * ConfirmModal — generic confirmation dialog (delete, etc.)
 *
 * Usage:
 *   <ConfirmModal
 *     title="حذف اللوحة"
 *     message="هل أنت متأكد؟ لا يمكن التراجع."
 *     confirmLabel="حذف"
 *     onCancel={() => setConfirm(null)}
 *     onConfirm={() => handleDelete(id)}
 *     danger
 *   />
 */
const ConfirmModal = memo(
  ({
    title = "تأكيد",
    message,
    confirmLabel = "تأكيد",
    cancelLabel = "إلغاء",
    onCancel,
    onConfirm,
    danger = true,
    icon: Icon = Trash2,
  }) => {
    const IconComponent = Icon;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div
          className="bg-white rounded-2xl shadow-xl p-6 w-80 text-center"
          dir="rtl"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${danger ? "bg-red-100" : "bg-secondary/10"}`}
          >
            <IconComponent
              size={22}
              className={danger ? "text-red-500" : "text-secondary"}
            />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
          {message && <p className="text-sm text-gray-500 mb-5">{message}</p>}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 rounded-lg text-white text-sm transition-colors ${
                danger
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-secondary hover:opacity-90"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    );
  },
);

ConfirmModal.displayName = "ConfirmModal";
export default ConfirmModal;
