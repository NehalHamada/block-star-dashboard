import { memo } from "react";

/**
 * EmptyState — centered icon + message shown when a list is empty
 *
 * Usage:
 *   <EmptyState icon={Package} message="لا توجد طلبات" />
 */
const EmptyState = memo(({ icon: Icon, message, iconSize = 36 }) => (
  <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
    {Icon && <Icon size={iconSize} className="text-gray-200" />}
    <p className="text-sm">{message}</p>
  </div>
));

EmptyState.displayName = "EmptyState";
export default EmptyState;
