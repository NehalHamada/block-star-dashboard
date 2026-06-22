import {
  categorySchema,
  subCategorySchema,
  productSchema,
} from "../validationSchemas";

// ─── categorySchema ────────────────────────────────────────────────────────────
describe("categorySchema", () => {
  it("accepts valid data", () => {
    const result = categorySchema.safeParse({
      name: "أثاث",
      name_en: "Furniture",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = categorySchema.safeParse({ name: "", name_en: "Furniture" });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("اسم الفئة مطلوب");
  });

  it("rejects missing name_en", () => {
    const result = categorySchema.safeParse({ name: "أثاث", name_en: "" });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Category name is required");
  });

  it("allows optional description fields", () => {
    const result = categorySchema.safeParse({
      name: "أثاث",
      name_en: "Furniture",
      description: "وصف",
      description_en: "Description",
    });
    expect(result.success).toBe(true);
  });
});

// ─── subCategorySchema ─────────────────────────────────────────────────────────
describe("subCategorySchema", () => {
  it("accepts valid data", () => {
    const result = subCategorySchema.safeParse({
      name: "كراسي",
      name_en: "Chairs",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = subCategorySchema.safeParse({ name: "", name_en: "Chairs" });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("اسم القسم الفرعي مطلوب");
  });

  it("rejects empty name_en", () => {
    const result = subCategorySchema.safeParse({ name: "كراسي", name_en: "" });
    expect(result.success).toBe(false);
  });
});

// ─── productSchema ─────────────────────────────────────────────────────────────
describe("productSchema", () => {
  const validProduct = {
    name: "كرسي خشبي",
    description: "كرسي مريح",
    price: 250,
    stock_quantity: 10,
  };

  it("accepts a minimal valid product", () => {
    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = productSchema.safeParse({ ...validProduct, name: "" });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("اسم المنتج مطلوب");
  });

  it("rejects missing description", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      description: "",
    });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("وصف المنتج مطلوب");
  });

  it("rejects non-positive price", () => {
    const result = productSchema.safeParse({ ...validProduct, price: -5 });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe(
      "يجب أن يكون السعر أكبر من صفر"
    );
  });

  it("rejects zero price", () => {
    const result = productSchema.safeParse({ ...validProduct, price: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative stock_quantity", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      stock_quantity: -1,
    });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe(
      "الكمية يجب أن تكون صفرًا أو أكثر"
    );
  });

  it("accepts zero stock_quantity", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      stock_quantity: 0,
    });
    expect(result.success).toBe(true);
  });

  it("coerces price from string", () => {
    const result = productSchema.safeParse({ ...validProduct, price: "150" });
    expect(result.success).toBe(true);
    expect(result.data.price).toBe(150);
  });

  it("transforms empty original_price to undefined", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      original_price: "",
    });
    expect(result.success).toBe(true);
    expect(result.data.original_price).toBeUndefined();
  });

  it("accepts valid original_price", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      original_price: 300,
    });
    expect(result.success).toBe(true);
    expect(result.data.original_price).toBe(300);
  });

  it("defaults features to empty array", () => {
    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    expect(result.data.features).toEqual([]);
  });

  it("accepts colors with name, hex_code", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      colors: [{ name: "أبيض", hex_code: "#ffffff" }],
    });
    expect(result.success).toBe(true);
    expect(result.data.colors).toHaveLength(1);
  });

  it("accepts sizes", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      sizes: [{ size_name: "كبير", dimensions: "200x100" }],
    });
    expect(result.success).toBe(true);
    expect(result.data.sizes[0].size_name).toBe("كبير");
  });

  it("accepts valid phone_number or empty string", () => {
    const res1 = productSchema.safeParse({ ...validProduct, phone_number: "" });
    expect(res1.success).toBe(true);

    const res2 = productSchema.safeParse({ ...validProduct, phone_number: "0512345678" });
    expect(res2.success).toBe(true);
    expect(res2.data.phone_number).toBe("0512345678");

    const res3 = productSchema.safeParse({ ...validProduct, phone_number: "+966512345678" });
    expect(res3.success).toBe(true);
  });

  it("rejects invalid phone_number formats", () => {
    const res1 = productSchema.safeParse({ ...validProduct, phone_number: "abc" });
    expect(res1.success).toBe(false);

    const res2 = productSchema.safeParse({ ...validProduct, phone_number: "123" });
    expect(res2.success).toBe(false);

    const res3 = productSchema.safeParse({ ...validProduct, phone_number: "1234567890123456" });
    expect(res3.success).toBe(false);
  });
});
