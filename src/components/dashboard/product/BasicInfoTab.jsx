import { memo } from "react";

const inputCls = (err) =>
  `w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary bg-white transition-colors text-black ${
    err ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
  }`;

const Label = ({ children, required }) => (
  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
    {children} {required && <span className="text-red-400 normal-case tracking-normal">*</span>}
  </label>
);

const ErrMsg = ({ err }) =>
  err ? <p className="mt-1 text-xs text-red-500">{err.message}</p> : null;

/**
 * BasicInfoTab — names, prices, stock, types, descriptions, usage
 */
const BasicInfoTab = memo(
  ({
    register,
    errors,
    productTypes,
    woodTypes,
    showCategorySelectors = false,
    categories = [],
    subcategories = [],
    subSubcategories = [],
    selectedCategory = "",
    setSelectedCategory,
    selectedSubCategory = "",
    setSelectedSubCategory,
    selectedSubSubCategory = "",
    setSelectedSubSubCategory,
  }) => (
    <>
      {/* Category, Subcategory, and Sub-subcategory selectors (conditional) */}
      {/* RATIONALE: Renders selectors when adding/editing products from All Products dashboard tab where category context is not predetermined */}
      {showCategorySelectors && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-4">
          <div>
            <Label required>الفئة الرئيسية</Label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubCategory("");
                setSelectedSubSubCategory("");
              }}
              className={inputCls(errors.category_id)}
            >
              <option value="">-- اختر الفئة --</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label required>القسم الفرعي</Label>
            <select
              value={selectedSubCategory}
              onChange={(e) => {
                setSelectedSubCategory(e.target.value);
                setSelectedSubSubCategory("");
              }}
              disabled={!selectedCategory}
              className={inputCls(errors.subcategory_id)}
            >
              <option value="">-- اختر القسم الفرعي --</option>
              {subcategories
                .filter((s) => String(s.category_id || s.category?.id) === String(selectedCategory))
                .map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <Label>القسم الفرعي الفرعي</Label>
            <select
              value={selectedSubSubCategory}
              onChange={(e) => setSelectedSubSubCategory(e.target.value)}
              disabled={!selectedSubCategory}
              className={inputCls(errors.sub_subcategory_id)}
            >
              <option value="">-- اختر القسم الفرعي الفرعي --</option>
              {subSubcategories
                .filter((ss) => String(ss.subcategory_id || ss.subcategory?.id) === String(selectedSubCategory))
                .map((ss) => (
                  <option key={ss.id} value={String(ss.id)}>
                    {ss.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      )}

      {/* Name AR / EN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div dir="rtl">
          <Label required>اسم المنتج (AR)</Label>
          <input
            {...register("name")}
            className={inputCls(errors.name)}
            placeholder="مثال: كنبة خشبية فاخرة"
          />
          <ErrMsg err={errors.name} />
        </div>
        <div dir="ltr">
          <Label required>Product Name (EN)</Label>
          <input
            {...register("name_en")}
            className={inputCls(errors.name_en)}
            placeholder="e.g., Luxury Wooden Sofa"
          />
          <ErrMsg err={errors.name_en} />
        </div>
      </div>


    {/* Price / Original price */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label required>السعر (ر.س)</Label>
        <input
          type="number"
          step="0.01"
          min="0"
          {...register("price", { valueAsNumber: true })}
          className={inputCls(errors.price)}
          placeholder="0.00"
        />
        <ErrMsg err={errors.price} />
      </div>
      <div>
        <Label>السعر قبل الخصم</Label>
        <input
          type="number"
          step="0.01"
          min="0"
          {...register("original_price", { valueAsNumber: true })}
          className={inputCls(errors.original_price)}
          placeholder="اتركه فارغاً إن لا خصم"
        />
        <ErrMsg err={errors.original_price} />
      </div>
    </div>

    {/* Stock / Product type */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>الكمية في المخزون</Label>
        <input
          type="number"
          min="0"
          {...register("stock_quantity", { valueAsNumber: true })}
          className={inputCls(errors.stock_quantity)}
          placeholder="0"
        />
        <ErrMsg err={errors.stock_quantity} />
      </div>
      <div>
        <Label>نوع المنتج</Label>
        <select {...register("product_type_id")} className={inputCls(errors.product_type_id)}>
          <option value="">-- اختر نوع المنتج --</option>
          {productTypes.map((t) => (
            <option key={t.id} value={String(t.id)}>{t.name}</option>
          ))}
        </select>
        <ErrMsg err={errors.product_type_id} />
      </div>
    </div>

    {/* Wood type */}
    <div>
      <Label>نوع الخشب</Label>
      <select {...register("wood_type_id")} className={inputCls(errors.wood_type_id)}>
        <option value="">-- اختر نوع الخشب --</option>
        {woodTypes.map((w) => (
          <option key={w.id} value={String(w.id)}>{w.name}</option>
        ))}
      </select>
      <ErrMsg err={errors.wood_type_id} />
    </div>

    {/* WhatsApp Phone Number */}
    <div>
      {/* RATIONALE: LTR input direction is chosen for phone numbers to correctly align digit sequences and prefixes like "+" regardless of the Arabic UI layout. */}
      <Label>رقم الواتساب (WhatsApp Number)</Label>
      <input
        type="tel"
        {...register("phone_number")}
        className={inputCls(errors.phone_number)}
        placeholder="مثال: 05xxxxxxxx أو +9665xxxxxxxx"
        dir="ltr"
      />
      <ErrMsg err={errors.phone_number} />
    </div>

    {/* Description AR / EN */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div dir="rtl">
        <Label required>الوصف (AR)</Label>
        <textarea
          {...register("description")}
          rows={3}
          className={inputCls(errors.description) + " font-sans"}
          placeholder="وصف مختصر للمنتج..."
        />
        <ErrMsg err={errors.description} />
      </div>
      <div dir="ltr">
        <Label>Description (EN)</Label>
        <textarea
          {...register("description_en")}
          rows={3}
          className={inputCls(errors.description_en) + " font-sans"}
          placeholder="Short description..."
        />
      </div>
    </div>

    {/* Usage AR / EN */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div dir="rtl">
        <Label>طريقة الاستخدام (AR)</Label>
        <textarea
          {...register("usage")}
          rows={2}
          className={inputCls(errors.usage) + " font-sans"}
          placeholder="مثال: مثالي للصور العائلية"
        />
      </div>
      <div dir="ltr">
        <Label>Usage (EN)</Label>
        <textarea
          {...register("usage_en")}
          rows={2}
          className={inputCls(errors.usage_en) + " font-sans"}
          placeholder="e.g., Perfect for family photos"
        />
      </div>
    </div>
  </>
));

BasicInfoTab.displayName = "BasicInfoTab";
export default BasicInfoTab;
