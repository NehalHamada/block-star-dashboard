import { useState, useEffect, useCallback } from "react";
import { Users as UsersIcon, X } from "lucide-react";
import userService from "../services/userService";
import toast from "react-hot-toast";
import UserDrawer from "../components/dashboard/UserDrawer";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import Pagination from "../components/common/Pagination";
import SearchInput from "../components/common/SearchInput";

// ── Main Page ─────────────────────────────────────────────────────────────────
const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Drawer
  const [drawerUser, setDrawerUser] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const res = await userService.getUsers({ search: search || undefined, role: roleFilter || undefined, page });
        const paged = res.data;
        setUsers(paged.data ?? []);
        setCurrentPage(paged.current_page ?? 1);
        setLastPage(paged.last_page ?? 1);
        setTotal(paged.total ?? 0);
      } catch (err) {
        setError(err.message || "حدث خطأ أثناء جلب المستخدمين");
      } finally {
        setLoading(false);
      }
    },
    [search, roleFilter],
  );

  useEffect(() => {
    setCurrentPage(1);
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const openDrawer = useCallback(async (id) => {
    setDrawerUser(null);
    setDrawerLoading(true);
    try {
      const res = await userService.getUserById(id);
      setDrawerUser(res.data ?? res);
    } catch {
      setDrawerUser(null);
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerUser(null);
    setDrawerLoading(false);
  }, []);

  const hasFilters = search || roleFilter;
  const clearFilters = () => { setSearchInput(""); setSearch(""); setRoleFilter(""); };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="space-y-6">
      <PageHeader title="المستخدمين" subtitle={`إجمالي ${total} مستخدم`} />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-light-gray/10 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="بحث بالاسم أو الإيميل أو الفون..."
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-light-gray/30 rounded-lg text-sm text-text-black bg-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
          >
            <option value="">كل الأدوار</option>
            <option value="user">مستخدم</option>
            <option value="admin">مدير</option>
          </select>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <X size={14} />
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-light-gray/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="space-y-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-light-gray/5">
                <div className="w-9 h-9 rounded-full bg-light-gray animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-36 bg-light-gray animate-pulse" />
                  <div className="h-3 w-48 bg-light-beige animate-pulse" />
                </div>
                <div className="h-5 w-20 bg-light-gray rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-48 text-red-500 text-sm">{error}</div>
        ) : users.length === 0 ? (
          <EmptyState icon={UsersIcon} message="لا يوجد مستخدمون" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="border-b border-light-gray/10 bg-light-beige/30">
                  {["المستخدم", "الإيميل", "الهاتف", "الدور", "تاريخ التسجيل"].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold text-dark-gray uppercase whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => openDrawer(user.id)}
                    className="hover:bg-secondary/5 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-secondary font-semibold text-sm">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-text-black">{user.name}</p>
                          <p className="text-xs text-light-gray">#{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-dark-gray">{user.email}</td>
                    <td className="px-5 py-3 text-dark-gray whitespace-nowrap">{user.phone || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === "admin" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                      }`}>
                        {user.role === "admin" ? "مدير" : "مستخدم"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-dark-gray whitespace-nowrap">{formatDate(user.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          onPrev={() => fetchUsers(currentPage - 1)}
          onNext={() => fetchUsers(currentPage + 1)}
        />
      </div>

      <UserDrawer
        user={drawerUser}
        loading={drawerLoading}
        onClose={closeDrawer}
        onDelete={async (id) => {
          await userService.deleteUser(id);
          setUsers((prev) => prev.filter((u) => u.id !== id));
          closeDrawer();
          toast.success("تم حذف المستخدم بنجاح");
        }}
      />
    </div>
  );
};

export default Users;
