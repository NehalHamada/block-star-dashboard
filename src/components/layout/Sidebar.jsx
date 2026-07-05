import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  LogOut,
  Menu,
  X,
  ShoppingCart,
  ChevronDown,
  MessageSquare,
  User,
  Phone,
  Home,
  Ticket,
  ListOrdered,
  TreePine,
  Frame,
  PanelRightClose,
  PanelRightOpen,
  Building2,
  Handshake,
  Grid3x3,
  PackageOpen,
  Star,
  Info,
  Mail,
  Building,
  Briefcase,
  Sparkles,
  ClipboardList,
  Truck,
} from "lucide-react";

import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";
import { useAuth } from "../../hooks/useAuth";
import logo from "/icon.png";

const SIDEBAR_ITEMS = [
  {
    name: "نظرة عامة",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    name: "الصفحة الرئيسية",
    icon: Home,
    path: "/home",
  },
  {
    name: "الكوبونات",
    icon: Ticket,
    path: "/coupons",
  },
  {
    name: "اللوحات الفنية الخاصة",
    icon: Frame,
    path: "/artistic-boards",
  },
  {
    name: "المتجر",
    icon: ShoppingBag,
    children: [
      { name: "كل المنتجات", icon: PackageOpen, path: "/products" },
      { name: "الفئات", icon: Grid3x3, path: "/category" },
      { name: "الأقسام الفرعية", icon: Grid3x3, path: "/subcategories" },
      { name: "الأقسام الفرعية الفرعية", icon: Grid3x3, path: "/sub-subcategories" },
      { name: "الطلبات", icon: ShoppingCart, path: "/orders" },
      { name: "أنواع المنتجات والخشب", icon: TreePine, path: "/product-types" },
    ],
  },
  {
    name: "التحكم في سعر الشحن",
    icon: Truck,
    path: "/shipping",
  },
  {
    name: "المستخدمين",
    icon: Users,
    children: [
      { name: "قائمة المستخدمين", icon: User, path: "/users" },
      { name: "آراء المستخدمين", icon: Star, path: "/reviews" },
    ],
  },
  {
    name: "إدارة المحتوى",
    icon: Building2,
    children: [
      { name: "من نحن", icon: Info, path: "/about" },
      { name: "بيانات التواصل", icon: Phone, path: "/contact-info" },
      { name: "رسائل التواصل", icon: Mail, path: "/contact-messages" },
    ],
  },
  {
    name: "طلبات الشركات",
    icon: Handshake,
    children: [
      { name: "عرض معلومات الصفحة", icon: Building, path: "/company-info" },
      { name: "خدماتنا للشريكات", icon: Briefcase, path: "/partner-services" },
      { name: "ميزاتنا", icon: Sparkles, path: "/partner-features" },
      { name: "طلبات الشريكات", icon: ClipboardList, path: "/partner-orders" },
    ],
  },
];

const DrawerItem = ({ item, closeSidebar, collapsed }) => {
  const location = useLocation();
  const isChildActive = item.children?.some((child) =>
    location.pathname.startsWith(child.path),
  );
  const [isOpen, setIsOpen] = useState(isChildActive);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef(null);

  // Close popover on outside click
  useEffect(() => {
    if (!popoverOpen) return;
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popoverOpen]);

  // Collapsed mode: click to open a popover with children
  if (collapsed) {
    return (
      <div className="relative" ref={popoverRef}>
        <button
          onClick={() => setPopoverOpen((prev) => !prev)}
          className={cn(
            "flex items-center justify-center w-full p-3 rounded-lg transition-colors cursor-pointer",
            isChildActive || popoverOpen
              ? "bg-primary text-white"
              : "text-white hover:bg-white/15 hover:text-primary",
          )}>
          <item.icon className="h-5 w-5 shrink-0" />
        </button>

        {/* Click-based popover with children */}
        {popoverOpen && (
          <div className="absolute right-full top-0 mr-2 z-50 animate-[fadeIn_0.15s_ease-out]">
            <div className="bg-[#B4B4B4] border border-white/20 rounded-lg shadow-2xl py-2 min-w-48">
              <div className="px-3 py-1.5 text-xs font-bold text-primary border-b border-white/20 mb-1">
                {item.name}
              </div>
              {item.children.map((child) => (
                <NavLink
                  key={child.path}
                  to={child.path}
                  onClick={() => {
                    setPopoverOpen(false);
                    closeSidebar();
                  }}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-white"
                        : "text-white hover:bg-white/15 hover:text-primary",
                    )
                  }>
                  <child.icon className="ml-2 h-4 w-4 shrink-0" />
                  {child.name}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors",
          isChildActive
            ? "bg-primary text-white"
            : "text-white hover:bg-white/15 hover:text-primary",
        )}>
        <item.icon className="ml-3 h-5 w-5 shrink-0" />
        <span className="flex-1 text-right">{item.name}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen ? "rotate-180" : "",
          )}
        />
      </button>

      {/* Children */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0",
        )}>
        <div className="mt-1 mr-4 space-y-1 border-r border-light-gray/20 pr-3">
          {item.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-white hover:bg-white/15 hover:text-primary",
                )
              }>
              <child.icon className="ml-2 h-4 w-4 shrink-0" />
              {child.name}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const closeSidebar = () => setIsMobileOpen(false);
  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-[#B4B4B4] text-white rounded-md"
        onClick={toggleMobileSidebar}>
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 right-0 z-40 h-screen bg-[#B4B4B4] text-white transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full flex flex-col",
          isMobileOpen
            ? "translate-x-0 overflow-hidden"
            : "translate-x-full lg:overflow-visible",
          isCollapsed ? "lg:w-18" : "lg:w-64",
          "w-64",
        )}>
        {/* Logo */}
        <div className="flex items-center justify-center h-20 bg-[#B4B4B4] border-b border-white/20 shrink-0">
          <img
            src={logo}
            alt="logo"
            className={cn(
              "py-4 transition-all duration-300 w-30",
              isCollapsed ? "w-10" : "",
            )}
          />
        </div>

        {/* Collapse Toggle Button (Desktop only) */}
        <div className="hidden lg:flex items-center justify-center py-2 shrink-0">
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-lg text-white hover:bg-white/15 hover:text-primary transition-colors"
            title={isCollapsed ? "توسيع القائمة" : "تصغير القائمة"}>
            {isCollapsed ? (
              <PanelRightOpen className="h-5 w-5" />
            ) : (
              <PanelRightClose className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav
          className={cn(
            "space-y-1 flex-1 min-h-0 py-4 sidebar-scroll",
            isCollapsed ? "px-2 lg:overflow-visible" : "px-4 overflow-y-auto",
          )}>
          {SIDEBAR_ITEMS.map((item) =>
            item.children ? (
              <DrawerItem
                key={item.name}
                item={item}
                closeSidebar={closeSidebar}
                collapsed={isCollapsed}
              />
            ) : isCollapsed ? (
              /* Collapsed: icon only with tooltip */
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-center p-3 rounded-lg transition-colors relative group",
                    isActive
                      ? "bg-primary text-white"
                      : "text-white hover:bg-white/15 hover:text-primary",
                  )
                }>
                <item.icon className="h-5 w-5 shrink-0" />
                {/* Tooltip */}
                <div className="absolute right-full mr-2 hidden group-hover:block z-50">
                  <div className="bg-[#B4B4B4] border border-white/20 rounded-lg shadow-xl px-3 py-2 whitespace-nowrap text-sm text-white">
                    {item.name}
                  </div>
                </div>
              </NavLink>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-white hover:bg-white/15 hover:text-primary",
                  )
                }>
                <item.icon className="ml-3 h-5 w-5 shrink-0" />
                {item.name}
              </NavLink>
            ),
          )}
        </nav>

        {/* Logout */}
        <div className="w-full p-4 border-t border-white/20 shrink-0">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center w-full text-sm font-medium text-white rounded-lg hover:bg-white/15 hover:text-primary transition-colors",
              isCollapsed ? "justify-center p-3" : "px-4 py-3",
            )}
            title={isCollapsed ? "تسجيل الخروج" : undefined}>
            <LogOut className={cn("h-5 w-5", !isCollapsed && "ml-3")} />
            {!isCollapsed && "تسجيل الخروج"}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
