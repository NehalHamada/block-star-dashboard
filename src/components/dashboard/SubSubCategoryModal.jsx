import { X, Upload, Loader } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subSubCategorySchema } from "../../utils/validationSchemas";
import { categoryService } from "../../services/categoryService";
import { subCategoryService } from "../../services/subCategoryService";
import axiosInstance from "../../services/axiosInstance";
import Button from "../common/Button";

const SubSubCategoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  // Lists for categories and subcategories
  const [categories, setCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);

  // Selected category state for filtering
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // ── RHF setup ──────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(subSubCategorySchema),
    defaultValues: {
      subcategory_id: "",
      name: "",
      name_en: "",
      description: "",
      description_en: "",
    },
  });

  const watchSubcategoryId = watch("subcategory_id");

  // Fetch categories and all subcategories on mount
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          setLoadingLists(true);
          const [catsRes, subsRes] = await Promise.all([
            categoryService.getAll(),
            // RATIONALE: We fetch all subcategories using the /subcategories endpoint to enable instantaneous client-side filtering by category.
            axiosInstance.get("/subcategories")
          ]);
          setCategories(catsRes.data || []);
          setAllSubCategories(subsRes.data?.data || subsRes.data || []);
        } catch (error) {
          // Silent catch or handled by UI indicators
        } finally {
          setLoadingLists(false);
        }
      };
      loadData();
    }
  }, [isOpen]);

  // Seed form on initialData change
  useEffect(() => {
    if (isOpen && !loadingLists && allSubCategories.length > 0) {
      if (initialData) {
        reset({
          subcategory_id: String(initialData.subcategory_id || ""),
          name: initialData.name || "",
          name_en: initialData.name_en || "",
          description: initialData.description || "",
          description_en: initialData.description_en || "",
        });

        // Find parent category of the subcategory to preset the category select
        const currentSub = allSubCategories.find(
          (s) => String(s.id) === String(initialData.subcategory_id)
        );
        if (currentSub?.category?.id) {
          setSelectedCategoryId(String(currentSub.category.id));
        } else if (currentSub?.category_id) {
          setSelectedCategoryId(String(currentSub.category_id));
        }
        
        setPreview(initialData.image || null);
        setImageFile(null);
      } else {
        reset({
          subcategory_id: "",
          name: "",
          name_en: "",
          description: "",
          description_en: "",
        });
        setSelectedCategoryId("");
        setPreview(null);
        setImageFile(null);
      }
    }
  }, [isOpen, initialData, allSubCategories, loadingLists, reset]);

  // Filtered subcategories based on selected category
  const filteredSubCategories = useMemo(() => {
    if (!selectedCategoryId) return [];
    return allSubCategories.filter(
      (sub) => String(sub.category_id || sub.category?.id) === String(selectedCategoryId)
    );
  }, [allSubCategories, selectedCategoryId]);

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setSelectedCategoryId(catId);
    // Reset subcategory selection
    setValue("subcategory_id", "");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onFormSubmit = (data) => {
    onSubmit({ ...data, image: imageFile });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative animate-fadeIn">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900 text-right w-full">
            {initialData ? "تعديل القسم الفرعي الفرعي" : "إضافة قسم فرعي فرعي جديد"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="p-4 space-y-4 text-black overflow-y-auto max-h-[80vh]"
        >
          {loadingLists ? (
            <div className="flex justify-center items-center py-10">
              <Loader className="animate-spin h-6 w-6 text-secondary" />
              <span className="mr-2 text-sm text-gray-500">جاري تحميل الخيارات...</span>
            </div>
          ) : (
            <>
              {/* Category Dropdown */}
              <div dir="rtl">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الفئة الرئيسية <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={handleCategoryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary bg-white text-sm"
                >
                  <option value="">-- اختر الفئة الرئيسية --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Dropdown */}
              <div dir="rtl">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  القسم الفرعي <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("subcategory_id")}
                  disabled={!selectedCategoryId}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary bg-white text-sm ${
                    errors.subcategory_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">
                    {!selectedCategoryId
                      ? "اختر الفئة الرئيسية أولاً"
                      : "-- اختر القسم الفرعي --"}
                  </option>
                  {filteredSubCategories.map((sub) => (
                    <option key={sub.id} value={String(sub.id)}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                {errors.subcategory_id && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.subcategory_id.message}
                  </p>
                )}
              </div>

              {/* Name (AR) */}
              <div dir="rtl">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم القسم الفرعي الفرعي (بالعربية) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="مثال: كنب زاوية"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Name (EN) */}
              <div dir="ltr">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-subcategory Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("name_en")}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary ${
                    errors.name_en ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Corner Sofas"
                />
                {errors.name_en && (
                  <p className="mt-1 text-xs text-red-600">{errors.name_en.message}</p>
                )}
              </div>

              {/* Description (AR) */}
              <div dir="rtl">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوصف (بالعربية)
                </label>
                <textarea
                  {...register("description")}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary font-sans"
                  placeholder="وصف مختصر للقسم الفرعي الفرعي..."
                />
              </div>

              {/* Description (EN) */}
              <div dir="ltr">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (English)
                </label>
                <textarea
                  {...register("description_en")}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary font-sans"
                  placeholder="Short description..."
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                  صورة القسم الفرعي الفرعي
                </label>
                <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-secondary transition-colors">
                  <div className="space-y-1 text-center">
                    {preview ? (
                      <div className="relative w-full h-32 mb-2">
                        <img
                          src={preview}
                          alt="Preview"
                          className="mx-auto h-32 object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreview(null);
                            setImageFile(null);
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label
                            htmlFor="subsubcat-file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-secondary hover:text-secondary"
                          >
                            <span>رفع صورة</span>
                            <input
                              id="subsubcat-file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF max 5MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  إلغاء
                </Button>
                <Button type="submit" variant="primary" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader className="animate-spin ml-2 h-4 w-4" /> جاري الحفظ...
                    </span>
                  ) : initialData ? (
                    "تحديث"
                  ) : (
                    "حفظ"
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default SubSubCategoryModal;
