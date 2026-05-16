import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

const schema = z.object({
  name_ar: z.string().min(2, "الاسم بالعربية مطلوب"),
  name_en: z.string().min(2, "English name is required"),
  shipping_cost: z.number().min(0, "سعر الشحن يجب أن يكون 0 أو أكثر"),
});

const GovernorateModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name_ar: "",
      name_en: "",
      shipping_cost: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name_ar: initialData.name_ar || "",
        name_en: initialData.name_en || "",
        shipping_cost: Number(initialData.shipping_cost) || 0,
      });
    } else {
      reset({
        name_ar: "",
        name_en: "",
        shipping_cost: 0,
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-md shadow-2xl w-full max-w-md overflow-hidden border border-light-gray/20"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-light-gray/10 flex items-center justify-between bg-light-beige/30">
            <h3 className="text-lg font-bold text-text-black">
              {initialData ? "تعديل منطقة شحن" : "إضافة منطقة شحن جديدة"}
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-red-50 text-dark-gray hover:text-red-500 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-dark-gray">
                الاسم بالعربية
              </label>
              <input
                {...register("name_ar")}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.name_ar
                    ? "border-red-500 bg-red-50/30"
                    : "border-light-gray/30 focus:border-secondary"
                } outline-none transition-all text-right`}
                placeholder="مثال: مكة"
              />
              {errors.name_ar && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.name_ar.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-dark-gray text-left">
                Name in English
              </label>
              <input
                {...register("name_en")}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.name_en
                    ? "border-red-500 bg-red-50/30"
                    : "border-light-gray/30 focus:border-secondary"
                } outline-none transition-all text-left`}
                placeholder="e.g. Makkah"
                dir="ltr"
              />
              {errors.name_en && (
                <p className="text-xs text-red-500 mt-1 text-left">
                  {errors.name_en.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-dark-gray">
                سعر الشحن
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register("shipping_cost", { valueAsNumber: true })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.shipping_cost
                      ? "border-red-500 bg-red-50/30"
                      : "border-light-gray/30 focus:border-secondary"
                  } outline-none transition-all text-right`}
                  placeholder="0.00"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-gray text-sm">
                  ج.م
                </span>
              </div>
              {errors.shipping_cost && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.shipping_cost.message}
                </p>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-secondary hover:bg-secondary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : initialData ? (
                  "تحديث"
                ) : (
                  "إضافة"
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-light-gray/30 text-dark-gray font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GovernorateModal;
