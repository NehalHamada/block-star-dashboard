import { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  Mail,
  Phone,
  Inbox,
  User,
  Calendar,
  Clock,
  X,
  Building2,
  FileText,
  StickyNote,
  CheckCircle2,
  ChevronDown,
  Loader2,
} from "lucide-react";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/common/Card.jsx";
import Table, { TableCell, TableRow } from "../components/common/Table.jsx";
import companyService from "../services/companyService";

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

// ── Status badge ─────────────────────────────────────────────────────────────
const statusConfig = {
  pending: {
    label: "قيد الانتظار",
    classes: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  approved: {
    label: "مقبول",
    classes: "bg-green-50 text-green-700 border-green-200",
  },
  rejected: {
    label: "مرفوض",
    classes: "bg-red-50 text-red-600 border-red-200",
  },
  reviewed: {
    label: "قيد المراجعة",
    classes: "bg-blue-50 text-blue-700 border-blue-200",
  },
  cancelled: {
    label: "ملغي",
    classes: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

const StatusBadge = ({ status, label }) => {
  const cfg = statusConfig[status] ?? {
    label: label || status,
    classes: "bg-light-gray/5 text-dark-gray border-light-gray/20",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${cfg.classes}`}
    >
      {cfg.label || label}
    </span>
  );
};

// ── Info row inside drawer ────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value, dir }) => (
  <div className="flex items-start gap-3 p-3 bg-light-beige/30 rounded-xl">
    <Icon size={16} className="text-secondary flex-shrink-0 mt-0.5" />
    <div className="min-w-0">
      <p className="text-[10px] text-dark-gray uppercase font-semibold mb-0.5">
        {label}
      </p>
      <p className="text-sm text-text-black break-words" dir={dir}>
        {value || "—"}
      </p>
    </div>
  </div>
);

// ── Status Update Panel ───────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "pending",   label: "قيد الانتظار" },
  { value: "reviewed",  label: "قيد المراجعة" },
  { value: "approved",  label: "مقبول" },
  { value: "rejected",  label: "مرفوض" },
  { value: "cancelled", label: "ملغي" },
];

const StatusUpdatePanel = ({ request, onUpdated }) => {
  const [status, setStatus] = useState(request.status ?? "pending");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setErr(null);
    setSuccess(false);
    try {
      await companyService.updateRequestStatus(request.id, status);
      setSuccess(true);
      onUpdated(request.id, status);
      setTimeout(() => setSuccess(false), 2500);
    } catch (e) {
      setErr(typeof e === "string" ? e : "حدث خطأ أثناء تحديث الحالة");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-light-gray/10 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-light-beige/50 border-b border-light-gray/10">
        <CheckCircle2 size={14} className="text-secondary" />
        <p className="text-xs text-dark-gray uppercase font-semibold">تحديث الحالة</p>
      </div>
      <div className="p-4 space-y-3">
        {/* Dropdown */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setSuccess(false); setErr(null); }}
            disabled={saving}
            className="w-full appearance-none bg-white border border-light-gray/20 rounded-lg px-3 py-2 pr-8 text-sm text-text-black focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/50 transition-all disabled:opacity-60 cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-gray pointer-events-none" />
        </div>

        {/* Feedback */}
        {err && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{err}</p>
        )}
        {success && (
          <p className="text-xs text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2 flex items-center gap-1.5">
            <CheckCircle2 size={13} /> تم تحديث الحالة بنجاح
          </p>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || status === request.status}
          className="w-full flex items-center justify-center gap-2 bg-secondary text-white text-sm font-semibold py-2 rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>
    </div>
  );
};

// ── Request Drawer ────────────────────────────────────────────────────────────
const RequestDrawer = ({ request, onClose, onStatusUpdate }) => {
  if (!request) return null;
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed top-0 left-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-gray/10 bg-light-beige/30">
          <h2 className="text-base font-semibold text-text-black">
            تفاصيل الطلب
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-dark-gray hover:text-text-black hover:bg-light-gray/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Avatar + company */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary/80 to-secondary flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {(request.company_name || "?").charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {request.company_name || "—"}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge
                  status={request.status}
                  label={request.status_label}
                />
                <span className="text-xs text-dark-gray">#{request.id}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 gap-2">
            <InfoRow
              icon={User}
              label="اسم المسؤول"
              value={request.manager_name}
            />
            <InfoRow
              icon={Phone}
              label="هاتف 1"
              value={request.phone1}
              dir="ltr"
            />
            {request.phone2 && (
              <InfoRow
                icon={Phone}
                label="هاتف 2"
                value={request.phone2}
                dir="ltr"
              />
            )}
            <InfoRow
              icon={Mail}
              label="البريد الإلكتروني"
              value={request.email}
              dir="ltr"
            />
            <InfoRow
              icon={Briefcase}
              label="نوع الخدمة"
              value={request.service_type}
            />
            <InfoRow
              icon={Calendar}
              label="التسليم المتوقع"
              value={formatDate(request.expected_delivery)}
            />
            <InfoRow
              icon={Clock}
              label="تاريخ التقديم"
              value={formatDate(request.submitted_at)}
            />
          </div>

          {/* Description */}
          {request.description && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={15} className="text-secondary" />
                <p className="text-xs text-dark-gray uppercase font-semibold">
                  الوصف
                </p>
              </div>
              <div className="p-4 bg-light-beige/40 border border-secondary/20 rounded-xl">
                <p className="text-sm text-text-black leading-relaxed whitespace-pre-wrap">
                  {request.description}
                </p>
              </div>
            </div>
          )}

          {/* Admin notes */}
          {request.admin_notes && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <StickyNote size={15} className="text-secondary" />
                <p className="text-xs text-dark-gray uppercase font-semibold">
                  ملاحظات الإدارة
                </p>
              </div>
              <div className="p-4 bg-light-beige/40 border border-secondary/20 rounded-xl">
                <p className="text-sm text-text-black leading-relaxed whitespace-pre-wrap">
                  {request.admin_notes}
                </p>
              </div>
            </div>
          )}

          {/* Status update */}
          <StatusUpdatePanel request={request} onUpdated={onStatusUpdate} />

          {/* User account */}
          {request.user?.id && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User size={15} className="text-secondary" />
                <p className="text-xs text-dark-gray uppercase font-semibold">
                  حساب المستخدم
                </p>
              </div>
              <div className="p-4 bg-light-beige/40 border border-secondary/20 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary/80 to-secondary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {(request.user.name || "?").charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-black">
                      {request.user.name}
                    </p>
                    <p className="text-xs text-dark-gray truncate" dir="ltr">
                      {request.user.email}
                    </p>
                  </div>
                  <span className="mr-auto text-xs text-secondary font-mono bg-secondary/10 px-2 py-0.5 rounded-full flex-shrink-0">
                    #{request.user.id}
                  </span>
                </div>
                {request.user.phone && (
                  <p className="text-xs text-dark-gray pr-11" dir="ltr">
                    {request.user.phone}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ── Skeleton rows ─────────────────────────────────────────────────────────────
const SkeletonRows = () => (
  <div className="p-6 space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-12 bg-light-gray/5 rounded-lg animate-pulse" />
    ))}
  </div>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-light-gray gap-3">
    <Inbox size={48} className="text-light-gray/20" />
    <p className="text-sm">لا توجد طلبات بعد</p>
  </div>
);

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ name }) => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary/80 to-secondary flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
    {(name || "?").charAt(0)}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const CompanyOrders = () => {
  const [requests, setRequests] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  // Patch the status in local state so the table badge updates instantly
  const handleStatusUpdate = useCallback((id, newStatus) => {
    const cfg = statusConfig[newStatus];
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: newStatus, status_label: cfg?.label ?? newStatus }
          : r
      )
    );
    setSelected((prev) =>
      prev?.id === id
        ? { ...prev, status: newStatus, status_label: cfg?.label ?? newStatus }
        : prev
    );
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await companyService.getCompanyRequests();
      setRequests(res.data ?? []);
      setCount(res.count ?? res.data?.length ?? 0);
    } catch {
      setError("حدث خطأ أثناء جلب الطلبات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-black">طلبات الشركات</h1>
        <p className="text-sm text-dark-gray mt-0.5">
          متابعة طلبات الخدمات الواردة من الشركات
        </p>
      </div>

      {/* Table card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <CardTitle>جميع الطلبات</CardTitle>
            {!loading && (
              <span className="text-xs bg-secondary/10 text-secondary font-semibold px-2 py-0.5 rounded-full">
                {count} طلب
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {error && (
            <div className="mx-6 my-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          {loading && <SkeletonRows />}
          {!loading && !error && requests.length === 0 && <EmptyState />}
          {!loading && requests.length > 0 && (
            <Table
              headers={[
                "#",
                "الشركة",
                "المسؤول",
                "الخدمة",
                "الهاتف",
                "التسليم المتوقع",
                "تاريخ الطلب",
                "الحالة",
              ]}
            >
              {requests.map((req) => (
                <TableRow
                  key={req.id}
                  onClick={() => setSelected(req)}
                  className="cursor-pointer"
                >
                  {/* ID */}
                  <TableCell className="font-medium text-dark-gray text-xs w-8">
                    #{req.id}
                  </TableCell>

                  {/* Company */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar name={req.company_name} />
                      <div className="font-medium text-text-black text-sm whitespace-nowrap">
                        {req.company_name || "—"}
                      </div>
                    </div>
                  </TableCell>

                  {/* Manager */}
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-dark-gray whitespace-nowrap">
                      <User size={13} className="text-light-gray flex-shrink-0" />
                      {req.manager_name || "—"}
                    </div>
                  </TableCell>

                  {/* Service type */}
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-secondary/5 text-secondary px-2 py-0.5 rounded-full border border-secondary/10 whitespace-nowrap">
                      <Briefcase size={11} />
                      {req.service_type || "—"}
                    </span>
                  </TableCell>

                  {/* Phone */}
                  <TableCell>
                    <div
                      className="flex items-center gap-1 text-sm text-dark-gray"
                      dir="ltr"
                    >
                      <Phone
                        size={13}
                        className="text-light-gray flex-shrink-0"
                      />
                      {req.phone1 || "—"}
                    </div>
                  </TableCell>

                  {/* Expected delivery */}
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-dark-gray">
                      <Calendar
                        size={13}
                        className="text-light-gray flex-shrink-0"
                      />
                      {formatDate(req.expected_delivery)}
                    </div>
                  </TableCell>

                  {/* Submitted at */}
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-dark-gray">
                      <Clock
                        size={13}
                        className="text-light-gray flex-shrink-0"
                      />
                      {formatDate(req.submitted_at)}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusBadge status={req.status} label={req.status_label} />
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail drawer */}
      {selected && (
        <RequestDrawer
          request={selected}
          onClose={() => setSelected(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default CompanyOrders;
