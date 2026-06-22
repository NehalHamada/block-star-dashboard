import axiosInstance from "./axiosInstance";

// ─── Helper: builds FormData from product data ───────────────────────────────
function buildFormData(data) {
  const fd = new FormData();

  // Scalar fields
  if (data.subcategory_id) fd.append("subcategory_id", data.subcategory_id);
  fd.append("name", data.name || "");
  fd.append("name_en", data.name_en || "");
  fd.append("description", data.description || "");
  fd.append("description_en", data.description_en || "");
  fd.append("usage", data.usage || "");
  fd.append("usage_en", data.usage_en || "");
  fd.append("price", Number(data.price) || 0);
  fd.append("stock_quantity", Number(data.stock_quantity) || 0);
  if (data.product_type_id) fd.append("product_type_id", data.product_type_id);
  if (data.wood_type_id) fd.append("wood_type_id", data.wood_type_id);
  
  // RATIONALE: We append phone_number to FormData (sending an empty string if not provided) to ensure the backend can either update or clear the stored WhatsApp number on the product.
  fd.append("phone_number", data.phone_number || "");

  // original_price — only send when it's a valid positive number
  const origPrice = Number(data.original_price);
  if (!isNaN(origPrice) && origPrice > 0) {
    fd.append("original_price", origPrice);
  }

  // Features — Arabic
  (data.features || []).forEach((f, i) => {
    const val = typeof f === "object" && f !== null ? (f.value ?? "") : f;
    if (val) fd.append(`features[${i}]`, val);
  });

  // Features — English
  (data.features_en || []).forEach((f, i) => {
    const val = typeof f === "object" && f !== null ? (f.value ?? "") : f;
    if (val) fd.append(`features_en[${i}]`, val);
  });

  // Specifications — Arabic
  const specs = data.specifications || [];
  if (Array.isArray(specs)) {
    specs.forEach((spec) => {
      if (spec.key) fd.append(`specifications[${spec.key}]`, spec.value || "");
    });
  } else {
    Object.entries(specs).forEach(([key, value]) => {
      fd.append(`specifications[${key}]`, value || "");
    });
  }

  // Specifications — English
  const specsEn = data.specifications_en || [];
  if (Array.isArray(specsEn)) {
    specsEn.forEach((spec) => {
      if (spec.key)
        fd.append(`specifications_en[${spec.key}]`, spec.value || "");
    });
  } else {
    Object.entries(specsEn).forEach(([key, value]) => {
      fd.append(`specifications_en[${key}]`, value || "");
    });
  }

  // Colors — indexed array
  (data.colors || []).forEach((c, i) => {
    fd.append(`colors[${i}][name]`, c.name || "");
    fd.append(`colors[${i}][hex_code]`, c.hex_code || "");
    if (c.image_path instanceof File) {
      fd.append(`colors[${i}][image_path]`, c.image_path);
    }
    fd.append(`colors[${i}][order]`, c.order !== undefined ? c.order : i);
  });

  // Sizes — indexed array with size_name + dimensions
  (data.sizes || []).forEach((s, i) => {
    fd.append(`sizes[${i}][size_name]`, s.size_name || "");

    if (s.dimensions) fd.append(`sizes[${i}][dimensions]`, s.dimensions);
  });

  // Main image — File only
  if (data.main_image instanceof File) {
    fd.append("main_image", data.main_image);
  }

  // Additional gallery images — new File uploads only
  // Re-index from 0 so the server receives images[0], images[1], ...
  let imgIdx = 0;
  (data.images || []).forEach((f) => {
    if (f instanceof File) fd.append(`images[${imgIdx++}]`, f);
  });

  // Usage idea images — new File uploads only
  let usageIdx = 0;
  (data.usage_ideas || []).forEach((f) => {
    if (f instanceof File) fd.append(`usage_ideas[${usageIdx++}]`, f);
  });

  // Video — new File upload only
  if (data.video instanceof File) {
    fd.append("video", data.video);
  }

  // PDF Catalog file — new File upload only
  if (data.pdf_file instanceof File) {
    fd.append("pdf_file", data.pdf_file);
  }

  // DEBUG: log everything in FormData
  console.log("[buildFormData] entries:");
  for (const [k, v] of fd.entries()) {
    console.log(`  ${k}:`, v instanceof File ? `FILE: ${v.name}` : v);
  }

  return fd;
}

export const productService = {
  // GET /products
  async getAll(subcategoryId = null, categoryId = null) {
    try {
      const params = {};
      if (categoryId) params.category_id = categoryId;
      if (subcategoryId) params.subcategory_id = subcategoryId;
      const response = await axiosInstance.get("/products", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // GET /products/:id — fetches both AR + EN and merges into one flat object
  async getById(id) {
    try {
      const [arRes, enRes] = await Promise.allSettled([
        axiosInstance.get(`/products/${id}`, { params: { lang: "ar" } }),
        axiosInstance.get(`/products/${id}`, { params: { lang: "en" } }),
      ]);

      const ar =
        arRes.status === "fulfilled"
          ? (arRes.value.data?.data ?? arRes.value.data)
          : null;
      const en =
        enRes.status === "fulfilled"
          ? (enRes.value.data?.data ?? enRes.value.data)
          : null;

      if (!ar && !en) throw new Error("Failed to fetch product data");

      // Merge: AR fields are canonical, EN fields are suffixed with _en
      return {
        data: {
          ...(ar || en), // base (images, colors, sizes, etc.)
          // Arabic text fields
          name: ar?.name ?? "",
          description: ar?.description ?? "",
          usage: ar?.usage ?? "",
          features: ar?.features ?? [],
          specifications: ar?.specifications ?? [],
          // English text fields
          name_en: en?.name ?? "",
          description_en: en?.description ?? "",
          usage_en: en?.usage ?? "",
          features_en: en?.features ?? [],
          specifications_en: en?.specifications ?? [],
        },
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // POST /products  (form-data)
  async create(data) {
    try {
      console.log({ data });

      const fd = buildFormData(data);
      // NOTE: Do NOT manually set Content-Type — axios sets it automatically
      // with the correct multipart boundary when a FormData instance is passed.
      const response = await axiosInstance.post("/products", fd);
      return response.data;
    } catch (error) {
      console.error("[productService.create] Error:", error);
      if (error.response) {
        console.error(
          "[productService.create] Response data:",
          error.response.data,
        );
      }
      throw error.response?.data || error.message;
    }
  },

  // POST /products/:id/update  (form-data)
  async update(id, data) {
    try {
      const fd = buildFormData(data);
      const response = await axiosInstance.post(`/products/${id}/update`, fd);
      return response.data;
    } catch (error) {
      console.error("[productService.update] Error:", error);
      if (error.response) {
        console.error(
          "[productService.update] Response data:",
          error.response.data,
        );
      }
      throw error.response?.data || error.message;
    }
  },

  // DELETE /products/:id
  async delete(id) {
    try {
      const response = await axiosInstance.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getProductTypes() {
    try {
      const response = await axiosInstance.get("/product-types");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getWoodTypes() {
    try {
      const response = await axiosInstance.get("/wood-types");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
