import { memo } from "react";
import ToggleSwitch from "../common/ToggleSwitch";

const inputCls =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary bg-white";
const labelCls = "block text-xs font-semibold text-gray-500 mb-1";

// Computed once at module load — avoids calling Date.now() during render
const getMinDate = () => new Date(Date.now() + 60000).toISOString().slice(0, 16);

/**
 * CouponForm — shared form fields for both Add and Edit coupon modals
 *
 * Props: form, set (key setter), saving, submitLabel, onSubmit, onClose
 */
const CouponForm = memo(({ form, set, saving, submitLabel, onSubmit, onClose }) => {
  return (
    <form onSubmit={onSubmit} className="p-6 space-y-4">
      {/* Code */}
      <div>
        <label className={labelCls}>كود الخصم *</label>
        <input
          className={inputCls}
          placeholder="مثال: SUMMER30"
          value={form.code}
          onChange={(e) => set("code", e.target.value.toUpperCase())}
        />
      </div>

      {/* Type + Value */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>نوع الخصم *</label>
          <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
            <option value="percentage">نسبة مئوية (%)</option>
            <option value="fixed">مبلغ ثابت (ر.س)</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>القيمة *</label>
          <input
            type="number"
            min="0"
            className={inputCls}
            placeholder={form.type === "percentage" ? "10" : "50"}
            value={form.value}
            onChange={(e) => set("value", e.target.value)}
          />
        </div>
      </div>

      {/* Min order + Max uses */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>الحد الأدنى للطلب (ر.س)</label>
          <input
            type="number"
            min="0"
            className={inputCls}
            placeholder="0"
            value={form.min_order_amount}
            onChange={(e) => set("min_order_amount", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>الحد الأقصى للاستخدام</label>
          <input
            type="number"
            min="1"
            className={inputCls}
            placeholder="بلا حد"
            value={form.max_uses}
            onChange={(e) => set("max_uses", e.target.value)}
          />
        </div>
      </div>

      {/* Expiry */}
      <div>
        <label className={labelCls}>تاريخ الانتهاء (اختياري)</label>
        <input
          type="datetime-local"
          className={inputCls}
          min={getMinDate()}
          value={form.expires_at}
          onChange={(e) => set("expires_at", e.target.value)}
        />
        <p className="text-[11px] text-gray-400 mt-1">يجب أن يكون التاريخ في المستقبل</p>
      </div>

      {/* Active toggle */}
      <ToggleSwitch
        checked={form.is_active}
        onChange={() => set("is_active", !form.is_active)}
        label="تفعيل الكوبون"
      />

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-60"
        >
          {saving && (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {saving ? "جارٍ الحفظ..." : submitLabel}
        </button>
      </div>
    </form>
  );
});

CouponForm.displayName = "CouponForm";
export default CouponForm;
