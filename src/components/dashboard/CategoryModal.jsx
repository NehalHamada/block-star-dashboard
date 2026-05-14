import { X, Upload, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "../../utils/validationSchemas";
import Button from "../common/Button";

const CategoryModal = ({
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
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", name_en: "", description: "", description_en: "" },
  });

  // RHF reset is the library's recommended pattern for seeding edit data
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
          <h2 className="text-xl font-semibold text-text-black text-right w-full">
            {initialData ? "تعديل الفئة" : "إضافة فئة جديدة"}
          </h2>
          <button
            onClick={onClose}
            className="text-light-gray hover:text-dark-gray transition-colors"
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
            <label className="block text-sm font-medium text-dark-gray mb-1">
              اسم الفئة (بالعربية) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("name")}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 ${
                errors.name ? "border-red-500" : "border-light-gray/20"
              }`}
              placeholder="مثال: غرف معيشة"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Name (EN) */}
          <div dir="ltr">
            <label className="block text-sm font-medium text-dark-gray mb-1">
              Category Name (English) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("name_en")}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 ${
                errors.name_en ? "border-red-500" : "border-light-gray/20"
              }`}
              placeholder="e.g., Living Rooms"
            />
            {errors.name_en && (
              <p className="mt-1 text-xs text-red-600">{errors.name_en.message}</p>
            )}
          </div>

          {/* Description (AR) */}
          <div dir="rtl">
            <label className="block text-sm font-medium text-dark-gray mb-1">
              وصف الفئة (بالعربية)
            </label>
            <textarea
              {...register("description")}
              rows="2"
              className="w-full px-3 py-2 border border-light-gray/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 font-sans"
              placeholder="وصف مختصر للفئة..."
            />
          </div>

          {/* Description (EN) */}
          <div dir="ltr">
            <label className="block text-sm font-medium text-dark-gray mb-1">
              Category Description (English)
            </label>
            <textarea
              {...register("description_en")}
              rows="2"
              className="w-full px-3 py-2 border border-light-gray/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 font-sans"
              placeholder="Short description..."
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-dark-gray mb-1">
              صورة الفئة
            </label>
            <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-light-gray/20 border-dashed rounded-lg hover:border-secondary transition-colors">
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
                    <Upload className="mx-auto h-12 w-12 text-light-gray" />
                    <div className="flex text-sm text-dark-gray justify-center">
                      <label
                        htmlFor="cat-file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-secondary hover:opacity-80"
                      >
                        <span>رفع صورة</span>
                        <input
                          id="cat-file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-light-gray">
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

export default CategoryModal;
