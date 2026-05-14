import { memo } from "react";

/**
 * PageHeader — reusable page title + subtitle + optional action buttons
 *
 * Usage:
 *   <PageHeader title="الطلبات" subtitle="إجمالي 30 طلب">
 *     <button ...>إضافة</button>
 *   </PageHeader>
 */
const PageHeader = memo(({ title, subtitle, children }) => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      {subtitle && (
        <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
      )}
    </div>
    {children && (
      <div className="flex items-center gap-2">{children}</div>
    )}
  </div>
));

PageHeader.displayName = "PageHeader";
export default PageHeader;
