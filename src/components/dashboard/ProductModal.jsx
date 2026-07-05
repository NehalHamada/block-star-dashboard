import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { productSchema } from "../../utils/validationSchemas";
import { productService } from "../../services/productService";
import BasicInfoTab from "./product/BasicInfoTab";
import MediaTab from "./product/MediaTab";
import DetailsTab from "./product/DetailsTab";
import VariantsTab from "./product/VariantsTab";

const TABS = [
  { id: "basic", label: "المعلومات الأساسية" },
  { id: "media", label: "الصور والفيديو" },
  { id: "details", label: "التفاصيل" },
  { id: "variants", label: "الألوان والأحجام" },
];

const ProductModal = ({ onClose, onSubmit, initialData, isLoading, subcategoryId, subSubcategoryId }) => {
  const [tab, setTab] = useState("basic");

  // ── Types from API ─────────────────────────────────────────────────────────
  const [productTypes, setProductTypes] = useState([]);
  const [woodTypes, setWoodTypes] = useState([]);

  useEffect(() => {
    productService.getProductTypes().then((r) => setProductTypes(r.data || [])).catch(() => {});
    productService.getWoodTypes().then((r) => setWoodTypes(r.data || [])).catch(() => {});
  }, []);

  // ── Media state ────────────────────────────────────────────────────────────
  const [mainImage, setMainImage] = useState(null);
  const [mainPreview, setMainPreview] = useState(() => {
    const imgs = initialData?.images || [];
    return initialData?.main_image || imgs.find((i) => i.order === 0)?.image_path || null;
  });
  const [extraImages, setExtraImages] = useState(() =>
    (initialData?.images || []).filter((i) => i.order > 0).map((i) => i.image_path).filter(Boolean),
  );
  const [extraPreviews, setExtraPreviews] = useState(() =>
    (initialData?.images || []).filter((i) => i.order > 0).map((i) => i.image_path).filter(Boolean),
  );
  const [usageIdeas, setUsageIdeas] = useState(() =>
    (initialData?.usage_ideas || []).map((i) => i.image_path).filter(Boolean),
  );
  const [usageIdeaPreviews, setUsagePreviews] = useState(() =>
    (initialData?.usage_ideas || []).map((i) => i.image_path).filter(Boolean),
  );
  const [video, setVideo] = useState(() => initialData?.videos?.[0]?.video_url || null);
  const [pdfFile, setPdfFile] = useState(null);
  const [currentPdfUrl, setCurrentPdfUrl] = useState(() => initialData?.pdf_file || null);

  // ── Temp chip inputs ───────────────────────────────────────────────────────
  const [newFeature, setNewFeature] = useState("");
  const [newFeatureEn, setNewFeatureEn] = useState("");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecKeyEn, setNewSpecKeyEn] = useState("");
  const [newSpecVal, setNewSpecVal] = useState("");
  const [newSpecValEn, setNewSpecValEn] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#D97706");
  const [newColorImage, setNewColorImage] = useState(null);
  const [newColorImagePreview, setNewColorImagePreview] = useState(null);
  const [newSizeName, setNewSizeName] = useState("");
  const [newSizeDim, setNewSizeDim] = useState("");

  // ── React Hook Form ────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", name_en: "", description: "", description_en: "",
      usage: "", usage_en: "", product_type_id: "", wood_type_id: "",
      price: undefined, original_price: undefined, stock_quantity: 0,
      features: [], features_en: [], specifications: [], specifications_en: [],
      colors: [], sizes: [], phone_number: "",
    },
  });

  const { fields: featureFields, append: addFeat, remove: removeFeat } = useFieldArray({ control, name: "features" });
  const { fields: featureEnFields, append: addFeatEn, remove: removeFeatEn } = useFieldArray({ control, name: "features_en" });
  const { fields: colorFields, append: addColor, remove: removeColor } = useFieldArray({ control, name: "colors" });
  const { fields: sizeFields, append: addSize, remove: removeSize } = useFieldArray({ control, name: "sizes" });
  const { fields: specFields, append: addSpec, remove: removeSpec } = useFieldArray({ control, name: "specifications" });
  const { fields: specEnFields, append: addSpecEn, remove: removeSpecEn } = useFieldArray({ control, name: "specifications_en" });

  // ── Seed form on open ──────────────────────────────────────────────────────
  useEffect(() => {
    const d = initialData;
    let specsArr = [];
    if (d?.specifications) {
      if (Array.isArray(d.specifications)) {
        specsArr = d.specifications.map((s) => ("key" in s ? { key: s.key, value: s.value } : { key: String(s), value: "" }));
      } else {
        specsArr = Object.entries(d.specifications).map(([key, value]) => ({ key, value: String(value) }));
      }
    }
    reset({
      name: d?.name || "", name_en: d?.name_en || "",
      description: d?.description || "", description_en: d?.description_en || "",
      usage: d?.usage || "", usage_en: d?.usage_en || "",
      product_type_id: d?.product_type?.id ? String(d.product_type.id) : d?.product_type_id ? String(d.product_type_id) : "",
      wood_type_id: d?.wood_type?.id ? String(d.wood_type.id) : d?.wood_type_id ? String(d.wood_type_id) : "",
      price: d?.price ? Number(d.price) : undefined,
      original_price: d?.original_price ? Number(d.original_price) : undefined,
      stock_quantity: d?.stock_quantity != null ? Number(d.stock_quantity) : 0,
      features: Array.isArray(d?.features) ? d.features : [],
      features_en: Array.isArray(d?.features_en) ? d.features_en : [],
      specifications: specsArr,
      specifications_en: Array.isArray(d?.specifications_en) ? d.specifications_en : [],
      colors: d?.colors?.map((c) => ({ name: c.name, hex_code: c.hex_code, image_path: c.image_path, order: c.order })) || [],
      sizes: d?.sizes?.map((s) => ({ size_name: s.size_name, dimensions: s.dimensions || "" })) || [],
      phone_number: d?.phone_number || "",
    });
    setCurrentPdfUrl(
      Array.isArray(d?.file) && d.file.length > 0
        ? d.file[0].file_path
        : d?.pdf_file || null
    );
    setPdfFile(null);
  }, [initialData, reset, productTypes.length, woodTypes.length]);

  // ── Image / video handlers ─────────────────────────────────────────────────
  const handleMainImage = (e) => {
    const f = e.target.files[0];
    if (f) { setMainImage(f); setMainPreview(URL.createObjectURL(f)); }
  };
  const handleExtraImages = (e) => {
    const files = Array.from(e.target.files);
    setExtraImages((p) => [...p, ...files]);
    setExtraPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };
  const handleUsageIdeas = (e) => {
    const files = Array.from(e.target.files);
    setUsageIdeas((p) => [...p, ...files]);
    setUsagePreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const handlePdfChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      if (f.type === "application/pdf") {
        setPdfFile(f);
      } else {
        toast.error("يرجى اختيار ملف PDF صالح");
      }
    }
  };

  // ── Adders ─────────────────────────────────────────────────────────────────
  const handleAddFeature = () => { if (newFeature.trim()) { addFeat(newFeature.trim()); setNewFeature(""); } };
  const handleAddFeatureEn = () => { if (newFeatureEn.trim()) { addFeatEn(newFeatureEn.trim()); setNewFeatureEn(""); } };
  const handleAddSpec = () => { if (newSpecKey.trim() && newSpecVal.trim()) { addSpec({ key: newSpecKey.trim(), value: newSpecVal.trim() }); setNewSpecKey(""); setNewSpecVal(""); } };
  const handleAddSpecEn = () => { if (newSpecKeyEn.trim() && newSpecValEn.trim()) { addSpecEn({ key: newSpecKeyEn.trim(), value: newSpecValEn.trim() }); setNewSpecKeyEn(""); setNewSpecValEn(""); } };
  const handleAddColor = () => { 
    if (newColorName.trim()) { 
      addColor({ name: newColorName.trim(), hex_code: newColorHex, image_path: newColorImage, order: colorFields.length }); 
      setNewColorName(""); 
      setNewColorHex("#D97706"); 
      setNewColorImage(null);
      setNewColorImagePreview(null);
    } 
  };
  const handleAddSize = () => { if (newSizeName.trim()) { addSize({ size_name: newSizeName.trim(), dimensions: newSizeDim.trim() }); setNewSizeName(""); setNewSizeDim(""); } };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onFormSubmit = (data) => {
    onSubmit({
      ...data,
      subcategory_id: subcategoryId,
      sub_subcategory_id: subSubcategoryId || initialData?.sub_subcategory_id || initialData?.sub_subcategory?.id || "",
      main_image: mainImage,
      images: extraImages,
      usage_ideas: usageIdeas,
      video,
      pdf_file: pdfFile
    });
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {initialData ? "تعديل المنتج" : "إضافة منتج جديد"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {initialData ? "عدّل البيانات واضغط حفظ" : "أدخل بيانات المنتج الجديد"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 flex-shrink-0 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id
                  ? "border-secondary text-secondary"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {tab === "basic" && (
              <BasicInfoTab
                register={register}
                errors={errors}
                productTypes={productTypes}
                woodTypes={woodTypes}
              />
            )}
            {tab === "media" && (
              <MediaTab
                mainPreview={mainPreview}
                onMainImageChange={handleMainImage}
                onClearMain={() => { setMainPreview(null); setMainImage(null); }}
                extraPreviews={extraPreviews}
                onExtraImages={handleExtraImages}
                onRemoveExtra={(i) => { setExtraImages((p) => p.filter((_, idx) => idx !== i)); setExtraPreviews((p) => p.filter((_, idx) => idx !== i)); }}
                usageIdeaPreviews={usageIdeaPreviews}
                onUsageIdeas={handleUsageIdeas}
                onRemoveUsage={(i) => { setUsageIdeas((p) => p.filter((_, idx) => idx !== i)); setUsagePreviews((p) => p.filter((_, idx) => idx !== i)); }}
                video={video}
                onVideoChange={(e) => { const f = e.target.files[0]; if (f) setVideo(f); }}
                onClearVideo={() => setVideo(null)}
              />
            )}
            {tab === "details" && (
              <DetailsTab
                control={control}
                featureFields={featureFields}
                newFeature={newFeature} onNewFeature={setNewFeature} onAddFeature={handleAddFeature} onRemoveFeat={removeFeat}
                featureEnFields={featureEnFields}
                newFeatureEn={newFeatureEn} onNewFeatureEn={setNewFeatureEn} onAddFeatureEn={handleAddFeatureEn} onRemoveFeatEn={removeFeatEn}
                specFields={specFields}
                newSpecKey={newSpecKey} newSpecVal={newSpecVal}
                onNewSpecKey={setNewSpecKey} onNewSpecVal={setNewSpecVal} onAddSpec={handleAddSpec} onRemoveSpec={removeSpec}
                specEnFields={specEnFields}
                newSpecKeyEn={newSpecKeyEn} newSpecValEn={newSpecValEn}
                onNewSpecKeyEn={setNewSpecKeyEn} onNewSpecValEn={setNewSpecValEn} onAddSpecEn={handleAddSpecEn} onRemoveSpecEn={removeSpecEn}
                pdfFile={pdfFile}
                currentPdfUrl={currentPdfUrl}
                onPdfChange={handlePdfChange}
                onClearPdf={() => { setPdfFile(null); setCurrentPdfUrl(null); }}
              />
            )}
            {tab === "variants" && (
              <VariantsTab
                control={control}
                colorFields={colorFields}
                newColorName={newColorName} newColorHex={newColorHex}
                newColorImagePreview={newColorImagePreview}
                onNewColorName={setNewColorName} onNewColorHex={setNewColorHex}
                onNewColorImage={(file) => {
                  setNewColorImage(file);
                  if (file) {
                    setNewColorImagePreview(URL.createObjectURL(file));
                  } else {
                    setNewColorImagePreview(null);
                  }
                }}
                onAddColor={handleAddColor} onRemoveColor={removeColor}
                sizeFields={sizeFields}
                newSizeName={newSizeName} newSizeDim={newSizeDim}
                onNewSizeName={setNewSizeName} onNewSizeDim={setNewSizeDim}
                onAddSize={handleAddSize} onRemoveSize={removeSize}
              />
            )}

            {/* Validation errors summary */}
            {hasErrors && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                <p className="font-semibold mb-1">يرجى تصحيح الأخطاء التالية:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  {Object.values(errors).map((e, i) => (
                    <li key={i}>{e?.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex-shrink-0 sticky bottom-0">
            {/* Tab dots */}
            <div className="flex gap-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    tab === t.id ? "bg-secondary" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-secondary text-white text-sm font-semibold hover:opacity-90 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {isLoading && (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {isLoading ? "جارٍ الحفظ..." : initialData ? "حفظ التعديلات" : "إنشاء المنتج"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
