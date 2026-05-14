import { memo } from "react";
import { X } from "lucide-react";

/**
 * ModalShell — base modal overlay + card container with optional header
 *
 * Usage:
 *   <ModalShell title="عنوان المودال" onClose={onClose} maxWidth="max-w-2xl">
 *     {children}
 *   </ModalShell>
 */
const ModalShell = memo(({ title, subtitle, onClose, children, maxWidth = "max-w-md", headerActions }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}>
      {/* Header */}
      {(title || onClose) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            {title && <h2 className="text-base font-bold text-gray-900">{title}</h2>}
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {headerActions}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  </div>
));

ModalShell.displayName = "ModalShell";
export default ModalShell;
