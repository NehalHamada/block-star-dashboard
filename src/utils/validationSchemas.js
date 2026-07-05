import { z } from "zod";

// ─── Category ────────────────────────────────────────────────────────────────
export const categorySchema = z.object({
  name: z.string().min(1, "اسم الفئة مطلوب"),
  name_en: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  description_en: z.string().optional(),
});

// ─── SubCategory ─────────────────────────────────────────────────────────────
export const subCategorySchema = z.object({
  name: z.string().min(1, "اسم القسم الفرعي مطلوب"),
  name_en: z.string().min(1, "Subcategory name is required"),
  description: z.string().optional(),
  description_en: z.string().optional(),
  category_id: z.string().optional(),
});

// ─── SubSubCategory ──────────────────────────────────────────────────────────
export const subSubCategorySchema = z.object({
  subcategory_id: z.string().min(1, "القسم الفرعي مطلوب"),
  name: z.string().min(1, "اسم القسم الفرعي الفرعي مطلوب"),
  name_en: z.string().min(1, "Sub-subcategory name is required"),
  description: z.string().optional(),
  description_en: z.string().optional(),
});

// ─── Product ──────────────────────────────────────────────────────────────────
export const productSchema = z.object({
  name: z.string().min(1, "اسم المنتج مطلوب"),
  name_en: z.string().optional().default(""),
  description: z.string().min(1, "وصف المنتج مطلوب"),
  description_en: z.string().optional().default(""),
  usage: z.string().optional().default(""),
  usage_en: z.string().optional().default(""),
  product_type_id: z.string().optional().default(""),
  wood_type_id: z.string().optional().default(""),
  subcategory_id: z.string().optional().default(""),
  sub_subcategory_id: z.string().optional().default(""),
  price: z.coerce
    .number({ invalid_type_error: "السعر يجب أن يكون رقمًا" })
    .positive("يجب أن يكون السعر أكبر من صفر"),
  original_price: z.coerce
    .number({ invalid_type_error: "السعر الأصلي يجب أن يكون رقمًا" })
    .positive()
    .optional()
    .or(z.literal(""))
    .nullable()
    .transform((v) => (v === "" || v == null ? undefined : Number(v))),
  stock_quantity: z.coerce
    .number({ invalid_type_error: "الكمية يجب أن تكون رقمًا" })
    .int()
    .min(0, "الكمية يجب أن تكون صفرًا أو أكثر")
    .default(0),
  features: z.array(z.string()).optional().default([]),
  features_en: z.array(z.string()).optional().default([]),
  specifications: z
    .array(z.object({ key: z.string(), value: z.string() }))
    .optional()
    .default([]),
  specifications_en: z
    .array(z.object({ key: z.string(), value: z.string() }))
    .optional()
    .default([]),
  colors: z
    .array(
      z.object({
        name: z.string(),
        hex_code: z.string(),
        image_path: z.any().optional(),
        order: z.number().optional()
      })
    )
    .optional()
    .default([]),
  sizes: z
    .array(
      z.object({
        size_name: z.string(),
        dimensions: z.string().optional().default(""),
      }),
    )
    .optional()
    .default([]),
  phone_number: z
    .string()
    .optional()
    .default("")
    .refine(
      (val) => !val || /^\+?[0-9]{7,15}$/.test(val),
      {
        message: "رقم الواتساب غير صحيح. يجب أن يتكون من أرقام فقط بطول من 7 إلى 15 رقمًا (مثال: 05xxxxxxxx)",
      }
    ),
});
