import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Trash2,
  Mail,
  Phone,
  Inbox,
  User,
  Calendar,
  X,
} from "lucide-react";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/common/Card.jsx";
import Table, { TableCell, TableRow } from "../components/common/Table.jsx";
import { contactMessageService } from "../services/contactMessageService";

// Delete Confirm Modal
const DeleteModal = ({ name, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <Trash2 className="text-red-500" size={22} />
        </div>
        <h3 className="text-lg font-semibold text-text-black">حذف الرسالة</h3>
        <p className="text-sm text-dark-gray">
          هل أنت متأكد من حذف رسالة{" "}
          <span className="font-medium text-text-black">{name}</span>؟
          <br />
          لا يمكن التراجع عن هذا الإجراء.
        </p>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2 rounded-lg border border-light-gray/20 text-dark-gray text-sm font-medium hover:bg-light-beige transition-colors disabled:opacity-50"
        >
          إلغاء
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {loading ? "جارٍ الحفظ..." : "حذف"}
        </button>
      </div>
    </div>
  </div>
);

// ── Skeleton Loader ──────────────────────────────────────────────────────
const SkeletonRows = () => (
  <div className="p-6 space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-12 bg-light-gray/5 rounded-lg animate-pulse" />
    ))}
  </div>
);

// ── Empty State ──────────────────────────────────────────────────────────
const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-dark-gray gap-3">
    <Inbox size={48} className="text-light-gray/30" />
    <p className="text-sm">{message}</p>
  </div>
);
// ── Format date ──────────────────────────────────────────────────────────
const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

// ── Message Drawer ─────────────────────────────────────────────────────
const MessageDrawer = ({ msg, onClose }) => {
  if (!msg) return null;
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel — slides in from the left (RTL layout) */}
      <div className="fixed top-0 left-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-base font-semibold text-gray-800">
            تفاصيل الرسالة
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Sender info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {(msg.full_name || "?").charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900">
                  {msg.full_name || "—"}
                </p>
                {msg.type === "registered" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    مسجّل
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                    ضيف
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">#الرسالة: {msg.id}</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Mail size={16} className="text-secondary flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">
                  البريد الإلكتروني
                </p>
                <p className="text-sm text-gray-700" dir="ltr">
                  {msg.email || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Phone size={16} className="text-secondary flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">
                  رقم الهاتف
                </p>
                <p className="text-sm text-gray-700" dir="ltr">
                  {msg.phone || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Calendar size={16} className="text-secondary flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">
                  تاريخ الإرسال
                </p>
                <p className="text-sm text-gray-700">
                  {formatDate(msg.sent_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Full message */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={15} className="text-secondary" />
              <p className="text-xs text-gray-400 uppercase font-semibold">
                نص الرسالة
              </p>
            </div>
            <div className="p-4 bg-secondary/5 border border-secondary/10 rounded-xl">
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {msg.message || "—"}
              </p>
            </div>
          </div>

          {/* Registered user account info */}
          {msg.type === "registered" && msg.user?.id && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User size={15} className="text-blue-500" />
                <p className="text-xs text-gray-400 uppercase font-semibold">
                  حساب الموقع
                </p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {(msg.user.name || "?").charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {msg.user.name}
                    </p>
                    <p className="text-xs text-gray-500" dir="ltr">
                      {msg.user.email}
                    </p>
                  </div>
                  <span className="mr-auto text-xs text-blue-500 font-mono bg-blue-100 px-2 py-0.5 rounded-full">
                    #{msg.user.id}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ── Avatar initials ──────────────────────────────────────────────────────
const Avatar = ({ name }) => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-secondary flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
    {(name || "?").charAt(0)}
  </div>
);

// ── Type badge ──────────────────────────────────────────────────────
const TypeBadge = ({ type }) =>
  type === "registered" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
      <User size={10} />
      مسجّل
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200 whitespace-nowrap">
      ضيف
    </span>
  );

// ═══════════════════════════════════════════════════════════════════════
// TAB 1 – All Messages
// Response: { success, count, data: [{ id, full_name, email, phone, message, sent_at }] }
// ═══════════════════════════════════════════════════════════════════════
const AllMessagesTab = () => {
  const [messages, setMessages] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await contactMessageService.getAll();
      // Response: { success, count, data: [...] }
      setMessages(res.data ?? []);
      setCount(res.count ?? res.data?.length ?? 0);
    } catch {
      setError("حدث خطأ أثناء جلب الرسائل");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await contactMessageService.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchMessages();
    } catch {
      alert("فشل حذف الرسالة، حاول مرة أخرى");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <CardTitle>جميع الرسائل</CardTitle>
          {!loading && (
            <span className="text-xs bg-secondary/10 text-secondary font-semibold px-2 py-0.5 rounded-full">
              {count} رسالة
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
        {!loading && !error && messages.length === 0 && (
          <EmptyState message="لا توجد رسائل بعد" />
        )}
        {!loading && messages.length > 0 && (
          <Table
            headers={[
              "id#",
              "المرسل",
              "النوع",
              "البريد الإلكتروني",
              "الهاتف",
              "الرسالة",
              "التاريخ",
              "الإجراءات",
            ]}
          >
            {messages.map((msg) => (
              <TableRow
                key={msg.id}
                onClick={() => setSelectedMsg(msg)}
                className="cursor-pointer"
              >
                {/* ID */}
                <TableCell className="font-medium text-gray-400 text-xs w-8">
                  #{msg.id}
                </TableCell>

                {/* Sender name */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar name={msg.full_name} />
                    <div className="font-medium text-gray-900 text-sm whitespace-nowrap">
                      {msg.full_name || "—"}
                    </div>
                  </div>
                </TableCell>

                {/* Type */}
                <TableCell>
                  <TypeBadge type={msg.type} />
                </TableCell>

                {/* Email */}
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Mail size={13} className="text-gray-400 flex-shrink-0" />
                    {msg.email || "—"}
                  </div>
                </TableCell>

                {/* Phone */}
                <TableCell>
                  <div
                    className="flex items-center gap-1 text-sm text-gray-600"
                    dir="ltr"
                  >
                    <Phone size={13} className="text-gray-400 flex-shrink-0" />
                    {msg.phone || "—"}
                  </div>
                </TableCell>

                {/* Message — clickable */}
                <TableCell>
                  <div className="text-sm text-gray-600 line-clamp-2 max-w-[240px] block text-right hover:text-secondary hover:underline transition-colors cursor-pointer">
                    {msg.message || "—"}
                  </div>
                </TableCell>

                {/* Date */}
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar
                      size={13}
                      className="text-gray-400 flex-shrink-0"
                    />
                    {formatDate(msg.sent_at)}
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <button
                    onClick={() => setDeleteTarget(msg)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="حذف الرسالة"
                  >
                    <Trash2 size={16} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </CardContent>

      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.full_name || "المرسل"}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* Message Drawer */}
      {selectedMsg && (
        <MessageDrawer msg={selectedMsg} onClose={() => setSelectedMsg(null)} />
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════
const TABS = [{ id: "all", label: "جميع الرسائل", icon: Inbox }];

const ContactMessage = () => {
  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">رسائل التواصل</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          إدارة ومتابعة رسائل التواصل الواردة
        </p>
      </div>

      {/* ── Tab content ── */}
      <Card>
        <AllMessagesTab />
      </Card>
    </div>
  );
};

export default ContactMessage;
