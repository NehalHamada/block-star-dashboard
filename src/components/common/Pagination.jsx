import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Pagination — prev/next pagination bar
 *
 * Usage:
 *   <Pagination
 *     currentPage={currentPage}
 *     lastPage={lastPage}
 *     onPrev={() => fetch(currentPage - 1)}
 *     onNext={() => fetch(currentPage + 1)}
 *   />
 */
const Pagination = memo(({ currentPage, lastPage, onPrev, onNext }) => {
  if (lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        صفحة {currentPage} من {lastPage}
      </p>
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage <= 1}
          onClick={onPrev}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
        <button
          disabled={currentPage >= lastPage}
          onClick={onNext}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
      </div>
    </div>
  );
});

Pagination.displayName = "Pagination";
export default Pagination;
