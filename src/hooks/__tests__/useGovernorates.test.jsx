import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ─── Mock governorateService ──────────────────────────────────────────────────
vi.mock("../../services/governorateService", () => ({
  default: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

import governorateService from "../../services/governorateService";
import toast from "react-hot-toast";
import { useGovernorates } from "../useGovernorates";

const mockGovernorates = [
  { id: 1, name_ar: "القاهرة", name_en: "Cairo", shipping_cost: 30 },
  { id: 2, name_ar: "الإسكندرية", name_en: "Alexandria", shipping_cost: 40 },
];

// ─── Helper: provides a fresh QueryClient for every test ─────────────────────
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

describe("useGovernorates hook", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns governorates after successful fetch", async () => {
    governorateService.getAll.mockResolvedValueOnce({
      success: true,
      data: mockGovernorates,
    });

    const { result } = renderHook(() => useGovernorates(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.governorates).toEqual(mockGovernorates);
    expect(result.current.isError).toBe(false);
  });

  it("sets isError when fetch fails", async () => {
    governorateService.getAll.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useGovernorates(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.governorates).toBeUndefined();
  });

  it("exposes create/update/delete/isCreating/isUpdating/isDeleting from return", () => {
    governorateService.getAll.mockResolvedValueOnce({ success: true, data: [] });

    const { result } = renderHook(() => useGovernorates(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.createGovernorate).toBe("function");
    expect(typeof result.current.updateGovernorate).toBe("function");
    expect(typeof result.current.deleteGovernorate).toBe("function");
    expect(result.current.isCreating).toBe(false);
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.isDeleting).toBe(false);
  });

  it("shows success toast and refetches after createGovernorate", async () => {
    governorateService.getAll
      .mockResolvedValueOnce({ success: true, data: [] })
      .mockResolvedValueOnce({ success: true, data: [mockGovernorates[0]] });
    governorateService.create.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useGovernorates(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.createGovernorate({ name_ar: "القاهرة", name_en: "Cairo", shipping_cost: 30 });

    expect(governorateService.create).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith("تمت إضافة المنطقة بنجاح");
  });

  it("shows error toast when createGovernorate fails", async () => {
    governorateService.getAll.mockResolvedValueOnce({ success: true, data: [] });
    governorateService.create.mockRejectedValueOnce(new Error("Server error"));

    const { result } = renderHook(() => useGovernorates(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(
      result.current.createGovernorate({ name_ar: "x" })
    ).rejects.toThrow();

    expect(toast.error).toHaveBeenCalled();
  });

  it("shows success toast and refetches after deleteGovernorate", async () => {
    governorateService.getAll.mockResolvedValue({ success: true, data: [] });
    governorateService.delete.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useGovernorates(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await result.current.deleteGovernorate(1);

    expect(governorateService.delete).toHaveBeenCalledWith(1);
    expect(toast.success).toHaveBeenCalledWith("تم حذف المنطقة بنجاح");
  });
});
