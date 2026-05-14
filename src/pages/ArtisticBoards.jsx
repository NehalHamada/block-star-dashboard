import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { CheckCircle, XCircle, Trash2, RefreshCw, Search, Cpu, Paintbrush, LayoutGrid, List } from "lucide-react";
import artisticBoardsService from "../services/artisticBoardsService";
import ConfirmModal from "../components/common/ConfirmModal";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";

// ── Small badges ──────────────────────────────────────────────────────────────
const TypeBadge = memo(({ type }) =>
  type === "ai" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary/10 text-secondary">
      <Cpu size={10} /> AI
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
      <Paintbrush size={10} /> مخصص
    </span>
  ),
);

const ApprovalBadge = memo(({ approved }) =>
  approved ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-600">
      <CheckCircle size={10} /> معتمد
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary/10 text-secondary">
      <XCircle size={10} /> قيد المراجعة
    </span>
  ),
);

// ── Board image ───────────────────────────────────────────────────────────────
const BoardImage = memo(({ board }) => {
  const src = board.image_url || board.preview_url || null;
  if (!src) return <div className="w-full h-full flex items-center justify-center bg-light-beige text-dark-gray text-xs">لا توجد صورة</div>;
  return (
    <img
      src={src}
      alt={board.title}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.target.style.display = "none";
        e.target.parentElement.innerHTML = '<span class="text-xs text-dark-gray">لا توجد صورة</span>';
      }}
    />
  );
});

// ── Board card (grid view) ────────────────────────────────────────────────────
const BoardCard = memo(({ board, onDelete, onApprove, actionLoading }) => (
  <div className="bg-white rounded-xl border border-light-gray/10 shadow-sm overflow-hidden flex flex-col">
    <div className="h-44 bg-light-beige relative overflow-hidden">
      <BoardImage board={board} />
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <TypeBadge type={board.type} />
        <ApprovalBadge approved={board.is_approved} />
      </div>
    </div>

    <div className="p-4 flex flex-col gap-2 flex-1">
      <h3 className="font-semibold text-text-black text-sm truncate" dir="rtl" title={board.title}>{board.title}</h3>
      {board.text && <p className="text-xs text-dark-gray line-clamp-2" dir="rtl">{board.text}</p>}

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-gray-500 mt-1">
        {board.size && <span>📐 <span className="font-medium">{board.size}</span></span>}
        {board.font && <span>🔤 <span className="font-medium">{board.font}</span></span>}
        {board.color && (
          <span className="flex items-center gap-1">
            🎨
            <span className="inline-block w-3 h-3 rounded-full border border-gray-200" style={{ background: board.color.startsWith("#") ? board.color : "#888" }} />
            <span className="font-medium">{board.color}</span>
          </span>
        )}
        {board.prompt && <span className="col-span-2 truncate" title={board.prompt}>💬 <span className="font-medium">{board.prompt}</span></span>}
      </div>

      <div className="mt-auto pt-2 border-t border-light-gray/10 flex justify-between text-[10px] text-light-gray">
        <span>#{board.id}</span>
        <span>{new Date(board.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}</span>
      </div>
    </div>

    <div className="flex border-t border-light-gray/10">
      <button
        onClick={() => onApprove(board.id)}
        disabled={actionLoading === board.id}
        className={`flex-1 py-2.5 text-xs font-medium transition-colors ${board.is_approved ? "text-secondary hover:bg-secondary/5" : "text-green-600 hover:bg-green-50"}`}
      >
        {actionLoading === board.id ? <RefreshCw size={13} className="animate-spin mx-auto" /> : board.is_approved ? "إلغاء الاعتماد" : "اعتماد"}
      </button>
      <div className="w-px bg-light-gray/10" />
      <button
        onClick={() => onDelete(board.id)}
        disabled={actionLoading === board.id}
        className="flex-1 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
      >
        <Trash2 size={13} className="mx-auto" />
      </button>
    </div>
  </div>
));

// ── Board row (list view) ─────────────────────────────────────────────────────
const BoardRow = memo(({ board, onDelete, onApprove, actionLoading }) => (
  <tr className="hover:bg-light-beige/30 transition-colors align-top">
    <td className="px-4 py-3">
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-light-beige flex-shrink-0"><BoardImage board={board} /></div>
    </td>
    <td className="px-4 py-3 text-sm text-text-black font-medium" dir="rtl">
      <div>{board.title}</div>
      <div className="text-[10px] text-light-gray mt-0.5">#{board.id}</div>
    </td>
    <td className="px-4 py-3"><TypeBadge type={board.type} /></td>
    <td className="px-4 py-3 text-xs text-gray-600 max-w-36" dir="rtl">
      {board.text && <p className="truncate" title={board.text}>{board.text}</p>}
      {board.prompt && <p className="truncate text-gray-400 italic" title={board.prompt}>💬 {board.prompt}</p>}
      {!board.text && !board.prompt && <span className="text-gray-300">—</span>}
    </td>
    <td className="px-4 py-3 text-xs text-dark-gray">{board.size || "—"}</td>
    <td className="px-4 py-3 text-xs text-dark-gray">{board.font || "—"}</td>
    <td className="px-4 py-3 text-xs">
      {board.color ? (
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full border border-gray-200 flex-shrink-0" style={{ background: board.color.startsWith("#") ? board.color : "#9ca3af" }} />
          <span className="text-gray-500 truncate max-w-16" title={board.color}>{board.color}</span>
        </span>
      ) : "—"}
    </td>
    <td className="px-4 py-3 text-xs text-dark-gray text-center">{board.product_type_id ?? "—"}</td>
    <td className="px-4 py-3 text-xs text-dark-gray text-center">{board.wood_type_id ?? "—"}</td>
    <td className="px-4 py-3"><ApprovalBadge approved={board.is_approved} /></td>
    <td className="px-4 py-3 text-xs text-light-gray">
      <div>{new Date(board.created_at).toLocaleDateString("ar-EG")}</div>
    </td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onApprove(board.id)}
          disabled={actionLoading === board.id}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${board.is_approved ? "bg-secondary/10 text-secondary hover:bg-secondary/20" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
        >
          {actionLoading === board.id ? <RefreshCw size={12} className="animate-spin" /> : board.is_approved ? "إلغاء" : "اعتماد"}
        </button>
        <button
          onClick={() => onDelete(board.id)}
          disabled={actionLoading === board.id}
          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </td>
  </tr>
));

// ── Main Page ─────────────────────────────────────────────────────────────────
const ArtisticBoards = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterApproved, setFilterApproved] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchBoards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await artisticBoardsService.getAll();
      setBoards(res.data || []);
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBoards(); }, [fetchBoards]);

  const handleApprove = useCallback(async (id, currentApproved) => {
    setActionLoading(id);
    try {
      await artisticBoardsService.approve(id, currentApproved);
      setBoards((prev) => prev.map((b) => b.id === id ? { ...b, is_approved: !currentApproved } : b));
    } catch (err) {
      console.error("Approve error:", err);
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    setDeleteConfirm(null);
    setActionLoading(id);
    try {
      await artisticBoardsService.remove(id);
      setBoards((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setActionLoading(null);
    }
  }, []);

  // Memoized filtered list
  const filtered = useMemo(() => {
    return boards.filter((b) => {
      const matchType = filterType === "all" || b.type === filterType;
      const matchApproved =
        filterApproved === "all" ||
        (filterApproved === "approved" && b.is_approved) ||
        (filterApproved === "pending" && !b.is_approved);
      const matchSearch =
        !search ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        (b.text || "").toLowerCase().includes(search.toLowerCase()) ||
        (b.prompt || "").toLowerCase().includes(search.toLowerCase());
      return matchType && matchApproved && matchSearch;
    });
  }, [boards, filterType, filterApproved, search]);

  // Memoized stats
  const stats = useMemo(() => ({
    total: boards.length,
    ai: boards.filter((b) => b.type === "ai").length,
    custom: boards.filter((b) => b.type === "custom").length,
    approved: boards.filter((b) => b.is_approved).length,
    pending: boards.filter((b) => !b.is_approved).length,
  }), [boards]);

  if (loading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="h-8 w-64 bg-light-gray/20 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-light-beige animate-pulse rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <div key={i} className="h-64 bg-light-beige animate-pulse rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={fetchBoards} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-white text-sm hover:opacity-90 transition-opacity">
          <RefreshCw size={14} /> إعادة المحاولة
        </button>
      </div>
    );
  }

  const FILTER_TYPES = [{ key: "all", label: "الكل" }, { key: "ai", label: "🤖 AI" }, { key: "custom", label: "🎨 مخصص" }];
  const FILTER_APPROVE = [{ key: "all", label: "الكل" }, { key: "approved", label: "✅ معتمد" }, { key: "pending", label: "⏳ قيد المراجعة" }];
  const STAT_ITEMS = [
    { label: "الإجمالي", value: stats.total, color: "text-text-black", bg: "bg-light-beige/50" },
    { label: "AI", value: stats.ai, color: "text-secondary", bg: "bg-secondary/5" },
    { label: "مخصص", value: stats.custom, color: "text-primary", bg: "bg-primary/5" },
    { label: "معتمد", value: stats.approved, color: "text-green-700", bg: "bg-green-50" },
    { label: "قيد المراجعة", value: stats.pending, color: "text-secondary", bg: "bg-secondary/5" },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader title="اللوحات الفنية الخاصة" subtitle="إدارة واعتماد اللوحات الفنية المخصصة">
        <button
          onClick={fetchBoards}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-light-gray/20 text-dark-gray text-sm hover:bg-light-beige transition-colors"
        >
          <RefreshCw size={14} /> تحديث
        </button>
      </PageHeader>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {STAT_ITEMS.map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4 border border-light-gray/10 shadow-sm text-center`}>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-dark-gray mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث بالعنوان أو النص..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-8 pl-3 py-2 border border-light-gray/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
            dir="rtl"
          />
        </div>

        {[{ options: FILTER_TYPES, value: filterType, onChange: setFilterType }, { options: FILTER_APPROVE, value: filterApproved, onChange: setFilterApproved }].map((group, gi) => (
          <div key={gi} className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
            {group.options.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => group.onChange(key)}
                className={`px-3 py-2 transition-colors ${group.value === key ? "bg-secondary text-white" : "bg-white text-dark-gray hover:bg-light-beige"}`}
              >
                {label}
              </button>
            ))}
          </div>
        ))}

        <div className="flex rounded-lg border border-light-gray/20 overflow-hidden ml-auto">
          {([{ mode: "grid", comp: LayoutGrid }, { mode: "list", comp: List }]).map((item) => (
            <button
              key={item.mode}
              onClick={() => setViewMode(item.mode)}
              className={`p-2 transition-colors ${viewMode === item.mode ? "bg-secondary text-white" : "bg-white text-dark-gray hover:bg-light-beige"}`}
            >
              <item.comp size={15} />
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400">عرض {filtered.length} من {boards.length} لوحة</p>

      {/* Grid / List view */}
      {viewMode === "grid" ? (
        filtered.length === 0 ? (
          <EmptyState message="لا توجد لوحات تطابق البحث" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onApprove={(id) => handleApprove(id, board.is_approved)}
                onDelete={(id) => setDeleteConfirm(id)}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )
      ) : (
        <div className="bg-white rounded-xl border border-light-gray/10 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState message="لا توجد لوحات تطابق البحث" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" dir="rtl">
                <thead>
                  <tr className="border-b border-light-gray/10 bg-light-beige/30 text-xs text-dark-gray">
                    {["الصورة", "العنوان", "النوع", "النص / البرومبت", "الحجم", "الخط", "اللون", "نوع المنتج", "نوع الخشب", "الحالة", "التاريخ", "إجراءات"].map((h) => (
                      <th key={h} className="px-4 py-3 text-right">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((board) => (
                    <BoardRow
                      key={board.id}
                      board={board}
                      onApprove={(id) => handleApprove(id, board.is_approved)}
                      onDelete={(id) => setDeleteConfirm(id)}
                      actionLoading={actionLoading}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <ConfirmModal
          title="حذف اللوحة"
          message="هل أنت متأكد من حذف هذه اللوحة؟ لا يمكن التراجع عن هذا الإجراء."
          confirmLabel="حذف"
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm)}
        />
      )}
    </div>
  );
};

export default ArtisticBoards;
