import { memo } from "react";

/**
 * FilterSelect — a styled select dropdown for filtering
 *
 * Usage:
 *   <FilterSelect
 *     label="كل الحالات"
 *     value={statusFilter}
 *     onChange={setStatusFilter}
 *     options={[{ value: 'pending', label: 'قيد الانتظار' }]}
 *   />
 */
const FilterSelect = memo(({ label, value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
  >
    <option value="">{label}</option>
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
));

FilterSelect.displayName = "FilterSelect";
export default FilterSelect;
