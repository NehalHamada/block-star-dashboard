import { X, Upload, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subCategorySchema } from "../../utils/validationSchemas";
import Button from "../common/Button";

const SubCategoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // ── RHF setup ──────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(subCategorySchema),
    defaultValues: { name: "", name_en: "", description: "", description_en: "" },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.name || "",
        name_en: initialData?.name_en || "",
        description: initialData?.description || "",
        description_en: initialData?.description_en || "",
      });
    }
  }, [isOpen, initialData, reset]);

  // Render-time reset for UI-only state (avoids setState-in-effect)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialData, setPrevInitialData] = useState(initialData);
  if (prevIsOpen !== isOpen || prevInitialData !== initialData) {
    setPrevIsOpen(isOpen);
    setPrevInitialData(initialData);
    if (isOpen) {
      setPreview(initialData?.image || null);
      setImageFile(null);
    }
  }

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
            {initialData ? "تعديل القسم الفرعي" : "إضافة قسم فرعي جديد"}
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
          {/* Name (AR) */}
          <div dir="rtl">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اسم القسم الفرعي (بالعربية) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("name")}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="مثال: كنب"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Name (EN) */}
          <div dir="ltr">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subcategory Name (English) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("name_en")}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary ${
                errors.name_en ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Sofas"
            />
            {errors.name_en && (
              <p className="mt-1 text-xs text-red-600">{errors.name_en.message}</p>
            )}
          </div>

          {/* Description (AR) */}
          <div dir="rtl">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              وصف القسم الفرعي (بالعربية)
            </label>
            <textarea
              {...register("description")}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary font-sans"
              placeholder="وصف مختصر للقسم الفرعي..."
            />
          </div>

          {/* Description (EN) */}
          <div dir="ltr">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subcategory Description (English)
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              صورة القسم الفرعي
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
                        htmlFor="subcat-file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-secondary hover:text-secondary"
                      >
                        <span>رفع صورة</span>
                        <input
                          id="subcat-file-upload"
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
        </form>
      </div>
    </div>
  );
};

export default SubCategoryModal;
