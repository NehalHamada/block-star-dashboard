import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

import axiosInstance from "../axiosInstance";
import { productService } from "../productService";

describe("productService.getAll", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches all products without filters", async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: { data: [{ id: 1, name: "كرسي" }] },
    });

    const result = await productService.getAll();

    expect(axiosInstance.get).toHaveBeenCalledWith("/products", { params: {} });
    expect(result.data).toHaveLength(1);
  });

  it("passes subcategoryId and categoryId as params", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { data: [] } });

    await productService.getAll(3, 1);

    expect(axiosInstance.get).toHaveBeenCalledWith("/products", {
      params: { subcategory_id: 3, category_id: 1 },
    });
  });

  it("throws on API error", async () => {
    axiosInstance.get.mockRejectedValueOnce({
      response: { data: { message: "Not found" } },
    });

    await expect(productService.getAll()).rejects.toMatchObject({
      message: "Not found",
    });
  });
});

describe("productService.getById", () => {
  beforeEach(() => vi.clearAllMocks());

  const arProduct = {
    id: 1, name: "كرسي", description: "وصف", usage: "استخدام",
    features: ["ميزة"], specifications: [{ key: "اللون", value: "بني" }],
    images: [], colors: [], sizes: [],
  };
  const enProduct = {
    id: 1, name: "Chair", description: "Description", usage: "Usage",
    features: ["Feature"], specifications: [{ key: "Color", value: "Brown" }],
  };

  it("merges AR and EN product data correctly", async () => {
    axiosInstance.get
      .mockResolvedValueOnce({ data: { data: arProduct } }) // AR
      .mockResolvedValueOnce({ data: { data: enProduct } }); // EN

    const result = await productService.getById(1);

    expect(result.data.name).toBe("كرسي");
    expect(result.data.name_en).toBe("Chair");
    expect(result.data.description).toBe("وصف");
    expect(result.data.description_en).toBe("Description");
    expect(result.data.features).toEqual(["ميزة"]);
    expect(result.data.features_en).toEqual(["Feature"]);
  });

  it("falls back to AR data when EN request fails", async () => {
    axiosInstance.get
      .mockResolvedValueOnce({ data: { data: arProduct } })
      .mockRejectedValueOnce(new Error("EN fetch failed"));

    const result = await productService.getById(1);

    expect(result.data.name).toBe("كرسي");
    expect(result.data.name_en).toBe(""); // EN not available
  });

  it("throws when both AR and EN requests fail", async () => {
    axiosInstance.get
      .mockRejectedValueOnce(new Error("AR failed"))
      .mockRejectedValueOnce(new Error("EN failed"));

    await expect(productService.getById(1)).rejects.toThrow(
      "Failed to fetch product data"
    );
  });
});

describe("productService.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends FormData to POST /products", async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { success: true } });

    await productService.create({
      name: "طاولة",
      description: "وصف",
      price: 500,
      stock_quantity: 5,
    });

    const [url, body] = axiosInstance.post.mock.calls[0];
    expect(url).toBe("/products");
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("name")).toBe("طاولة");
    expect(body.get("price")).toBe("500");
  });

  it("includes features in FormData at correct indexed keys", async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { success: true } });

    await productService.create({
      name: "طاولة",
      description: "وصف",
      price: 500,
      stock_quantity: 0,
      features: ["ميزة 1", "ميزة 2"],
    });

    const [, body] = axiosInstance.post.mock.calls[0];
    expect(body.get("features[0]")).toBe("ميزة 1");
    expect(body.get("features[1]")).toBe("ميزة 2");
  });

  it("skips original_price when falsy", async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { success: true } });

    await productService.create({
      name: "طاولة",
      description: "وصف",
      price: 500,
      stock_quantity: 0,
      original_price: 0,
    });

    const [, body] = axiosInstance.post.mock.calls[0];
    expect(body.get("original_price")).toBeNull();
  });

  it("includes pdf_file in FormData when a File is provided", async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { success: true } });

    const testPdf = new File(["test contents"], "catalog.pdf", { type: "application/pdf" });

    await productService.create({
      name: "طاولة",
      description: "وصف",
      price: 500,
      stock_quantity: 0,
      pdf_file: testPdf,
    });

    const [, body] = axiosInstance.post.mock.calls[0];
    expect(body.get("pdf_file")).toBe(testPdf);
  });
});

describe("productService.delete", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls DELETE /products/:id", async () => {
    axiosInstance.delete.mockResolvedValueOnce({ data: { success: true } });

    await productService.delete(99);

    expect(axiosInstance.delete).toHaveBeenCalledWith("/products/99");
  });
});

describe("productService.getProductTypes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls GET /product-types", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { data: [] } });

    await productService.getProductTypes();

    expect(axiosInstance.get).toHaveBeenCalledWith("/product-types");
  });
});

describe("productService.getWoodTypes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls GET /wood-types", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { data: [] } });

    await productService.getWoodTypes();

    expect(axiosInstance.get).toHaveBeenCalledWith("/wood-types");
  });
});
