import { memo } from "react";

/**
 * ToggleSwitch — reusable on/off toggle
 *
 * Usage:
 *   <ToggleSwitch checked={isActive} onChange={() => setActive(!isActive)} label="تفعيل" />
 */
const ToggleSwitch = memo(({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <div
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors ${
        checked ? "bg-secondary" : "bg-gray-200"
      }`}
    >
      <div
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </div>
    {label && <span className="text-sm text-gray-700">{label}</span>}
  </label>
));

ToggleSwitch.displayName = "ToggleSwitch";
export default ToggleSwitch;
