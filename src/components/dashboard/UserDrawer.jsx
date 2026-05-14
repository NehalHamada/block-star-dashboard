import { useState, memo } from "react";
import { X, MapPin, Phone, Mail, Calendar, Star, Trash2 } from "lucide-react";

const ROLE_CONFIG = {
  admin: { label: "مدير", color: "bg-secondary/10 text-secondary" },
  user: { label: "مستخدم", color: "bg-primary/10 text-primary" },
};

const RoleBadge = memo(({ role }) => {
  const cfg = ROLE_CONFIG[role] ?? {
    label: role,
    color: "bg-light-gray/20 text-dark-gray",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
});

/**
 * UserDrawer — sliding drawer panel showing user details + delete action
 */
const UserDrawer = ({ user, loading, onClose, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isOpen = loading || !!user;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-full max-w-sm z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-light-gray/10">
          <h2 className="text-base font-bold text-text-black">
            تفاصيل المستخدم
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-light-beige transition-colors"
          >
            <X size={18} className="text-dark-gray" />
          </button>
        </div>

        {loading ? (
          <div className="p-5 space-y-4 flex-1">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-light-gray animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-light-gray animate-pulse" />
                <div className="h-3 w-24 bg-light-beige animate-pulse" />
              </div>
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-light-beige animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : user ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-secondary font-bold text-xl">
                  {user.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-lg font-bold text-text-black">{user.name}</p>
                <RoleBadge role={user.role} />
              </div>
            </div>

            {/* Info cards */}
            <div className="space-y-2">
              {[
                { icon: Mail, value: user.email },
                { icon: Phone, value: user.phone || "—" },
                {
                  icon: Calendar,
                  value: new Date(user.created_at).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                },
              ].map(({ icon: Icon, value }, idx) => {
                const IconComponent = Icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-white/50 border border-light-gray/10 rounded-xl"
                  >
                    <IconComponent
                      size={15}
                      className="text-secondary flex-shrink-0"
                    />
                    <span className="text-sm text-text-black break-all">
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Addresses */}
            {user.addresses?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-dark-gray uppercase mb-3 flex items-center gap-1.5">
                  <MapPin size={13} />
                  العناوين ({user.addresses.length})
                </p>
                <div className="space-y-3">
                  {user.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-xl border ${
                        addr.is_default
                          ? "border-secondary/20 bg-secondary/5"
                          : "border-light-gray/10 bg-white"
                      }`}
                    >
                      {addr.is_default && (
                        <div className="flex items-center gap-1 mb-2">
                          <Star
                            size={11}
                            className="text-secondary fill-secondary"
                          />
                          <span className="text-[10px] font-semibold text-secondary">
                            العنوان الافتراضي
                          </span>
                        </div>
                      )}
                      <p className="text-sm font-medium text-text-black">
                        {addr.first_name} {addr.last_name}
                      </p>
                      <p className="text-xs text-dark-gray mt-0.5">
                        {addr.phone}
                      </p>
                      <p className="text-xs text-dark-gray mt-1">
                        {addr.city} — {addr.area}
                      </p>
                      <p className="text-xs text-light-gray mt-0.5 leading-relaxed">
                        {addr.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!user.addresses || user.addresses.length === 0) && (
              <div className="flex flex-col items-center justify-center py-8 text-gray-300 gap-2">
                <MapPin size={32} />
                <p className="text-xs">لا توجد عناوين مسجلة</p>
              </div>
            )}
          </div>
        ) : null}

        {/* Delete footer */}
        {user && (
          <div className="px-5 py-4 border-t border-light-gray/10 flex-shrink-0">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 w-full justify-center py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} />
                حذف المستخدم
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-center text-gray-500">
                  هل أنت متأكد من حذف «{user.name}»؟
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2 rounded-xl border border-light-gray/20 text-dark-gray text-sm hover:bg-light-beige transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={async () => {
                      setDeleting(true);
                      await onDelete(user.id);
                      setDeleting(false);
                      setConfirmDelete(false);
                    }}
                    disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
                  >
                    {deleting && (
                      <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {deleting ? "جارٍ..." : "تأكيد الحذف"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default UserDrawer;
