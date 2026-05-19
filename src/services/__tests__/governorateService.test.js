import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

import axiosInstance from "../axiosInstance";
import governorateService from "../governorateService";

const mockArData = [
  { id: 1, name: "القاهرة", shipping_cost: 30 },
  { id: 2, name: "الإسكندرية", shipping_cost: 40 },
];
const mockEnData = [
  { id: 1, name: "Cairo", shipping_cost: 30 },
  { id: 2, name: "Alexandria", shipping_cost: 40 },
];

describe("governorateService.getAll", () => {
  beforeEach(() => vi.clearAllMocks());

  it("merges Arabic and English names into a single list", async () => {
    axiosInstance.get
      .mockResolvedValueOnce({ data: { data: mockArData } }) // AR
      .mockResolvedValueOnce({ data: { data: mockEnData } }); // EN

    const result = await governorateService.getAll();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].name_ar).toBe("القاهرة");
    expect(result.data[0].name_en).toBe("Cairo");
  });

  it("falls back to AR name when EN item is missing", async () => {
    axiosInstance.get
      .mockResolvedValueOnce({ data: { data: mockArData } })
      .mockResolvedValueOnce({ data: { data: [] } }); // no EN data

    const result = await governorateService.getAll();

    expect(result.data[0].name_en).toBe("القاهرة"); // falls back to AR name
  });
});

describe("governorateService.getById", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns merged AR + EN names for a single governorate", async () => {
    axiosInstance.get
      .mockResolvedValueOnce({ data: { data: { id: 1, name: "القاهرة", shipping_cost: 30 } } })
      .mockResolvedValueOnce({ data: { data: { id: 1, name: "Cairo", shipping_cost: 30 } } });

    const result = await governorateService.getById(1);

    expect(result.success).toBe(true);
    expect(result.data.name_ar).toBe("القاهرة");
    expect(result.data.name_en).toBe("Cairo");
  });
});

describe("governorateService.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls POST /governorates with the provided data", async () => {
    const payload = { name_ar: "أسوان", name_en: "Aswan", shipping_cost: 50 };
    axiosInstance.post.mockResolvedValueOnce({ data: { success: true, data: { id: 3, ...payload } } });

    const result = await governorateService.create(payload);

    expect(axiosInstance.post).toHaveBeenCalledWith("/governorates", payload);
    expect(result.success).toBe(true);
  });
});

describe("governorateService.update", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls PUT /governorates/:id with updated data", async () => {
    const payload = { name_ar: "الجيزة", name_en: "Giza", shipping_cost: 35 };
    axiosInstance.put.mockResolvedValueOnce({ data: { success: true } });

    await governorateService.update(5, payload);

    expect(axiosInstance.put).toHaveBeenCalledWith("/governorates/5", payload);
  });
});

describe("governorateService.delete", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls DELETE /governorates/:id", async () => {
    axiosInstance.delete.mockResolvedValueOnce({ data: { success: true } });

    await governorateService.delete(7);

    expect(axiosInstance.delete).toHaveBeenCalledWith("/governorates/7");
  });
});
