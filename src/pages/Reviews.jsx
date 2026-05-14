import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Star,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/common/Card.jsx";
import Table, { TableCell, TableRow } from "../components/common/Table.jsx";
import { reviewService } from "../services/reviewService";

// ── Star display component ──────────────────────────────────────────
const StarRating = ({ value }) => {
  const num = Math.round(parseFloat(value));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < num ? "fill-secondary text-secondary" : "text-gray-300"
          }
        />
      ))}
      <span className="mr-1 text-xs text-gray-500">
        {parseFloat(value).toFixed(1)}
      </span>
    </div>
  );
};

// ── Pagination component ────────────────────────────────────────────
const Pagination = ({ current, last, onPageChange }) => {
  if (last <= 1) return null;

  const pages = Array.from({ length: last }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <button
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight size={18} />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors ${
            page === current
              ? "bg-secondary text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(current + 1)}
        disabled={current === last}
        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={18} />
      </button>
    </div>
  );
};

// ── Delete confirm modal ────────────────────────────────────────────
const DeleteModal = ({ review, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <Trash2 className="text-red-500" size={22} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">حذف الرأي</h3>
        <p className="text-sm text-gray-500">
          هل أنت متأكد من حذف رأي{" "}
          <span className="font-medium text-gray-700">
            {review?.user?.name}
          </span>
          ؟
          <br />
          لا يمكن التراجع عن هذا الإجراء.
        </p>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          إلغاء
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? "جارٍ الحذف..." : "حذف"}
        </button>
      </div>
    </div>
  </div>
);

// ── Main Reviews page ───────────────────────────────────────────────
const RATING_OPTIONS = [
  { value: "", label: "كل التقييمات" },
  { value: "5", label: "⭐⭐⭐⭐⭐ (5)" },
  { value: "4", label: "⭐⭐⭐⭐ (4)" },
  { value: "3", label: "⭐⭐⭐ (3)" },
  { value: "2", label: "⭐⭐ (2)" },
  { value: "1", label: "⭐ (1)" },
];

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    last: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ratingFilter, setRatingFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────
  const fetchReviews = useCallback(async (page = 1, rating = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await reviewService.getAll({ rating, page });
      const d = res.data;
      setReviews(d.data);
      setPagination({
        current: d.current_page,
        last: d.last_page,
        total: d.total,
      });
    } catch (err) {
      setError(typeof err === "string" ? err : "حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews(1, ratingFilter);
  }, [ratingFilter, fetchReviews]);

  const handlePageChange = (page) => {
    fetchReviews(page, ratingFilter);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Delete ────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await reviewService.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchReviews(pagination.current, ratingFilter);
    } catch {
      alert("فشل حذف الرأي، حاول مرة أخرى");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Format date ───────────────────────────────────────────────────
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">آراء المستخدمين</h1>

      <Card>
        {/* ── Header / Filters ── */}
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <CardTitle>آراء المستخدمين</CardTitle>
            {!loading && (
              <span className="text-xs bg-secondary/10 text-secondary font-semibold px-2 py-0.5 rounded-full">
                {pagination.total} رأي
              </span>
            )}
          </div>

          {/* Rating filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="pr-4 pl-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-sm bg-white text-gray-700"
          >
            {RATING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </CardHeader>

        <CardContent className="p-0">
          {/* ── Error ── */}
          {error && (
            <div className="mx-6 my-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* ── Loading skeleton ── */}
          {loading && (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && !error && reviews.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
              <MessageSquare size={48} className="text-gray-200" />
              <p className="text-sm">لا توجد آراء بعد</p>
            </div>
          )}

          {/* ── Table ── */}
          {!loading && reviews.length > 0 && (
            <Table
              headers={[
                "#",
                "المستخدم",
                "المنتج",
                "التقييم",
                "التعليق",
                "التاريخ",
                "الإجراءات",
              ]}
            >
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium text-gray-500 text-xs w-8">
                    #{review.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900 text-sm">
                      {review.user?.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {review.user?.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-700 line-clamp-1 max-w-[140px] block">
                      {review.product?.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StarRating value={review.rating} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 line-clamp-2 max-w-[200px] block">
                      {review.comment || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(review.created_at)}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => setDeleteTarget(review)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="حذف الرأي"
                    >
                      <Trash2 size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          )}

          {/* ── Pagination ── */}
          {!loading && pagination.last > 1 && (
            <Pagination
              current={pagination.current}
              last={pagination.last}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>

      {/* ── Delete Modal ── */}
      {deleteTarget && (
        <DeleteModal
          review={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default Reviews;
