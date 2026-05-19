import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock axiosInstance ────────────────────────────────────────────────────────
vi.mock("../axiosInstance", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// ─── Mock react-hot-toast ─────────────────────────────────────────────────────
vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

import axiosInstance from "../axiosInstance";
import { authService } from "../authService";
import toast from "react-hot-toast";

const adminUser = { id: 1, name: "Admin", role: "admin" };
const adminToken = "eyJhbGciOiJIUzI1NiJ9.test";

describe("authService.login", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("stores token and user in localStorage on successful admin login", async () => {
    axiosInstance.post.mockResolvedValueOnce({
      data: { data: { token: adminToken, user: adminUser } },
    });

    const result = await authService.login("admin@test.com", "password");

    expect(localStorage.getItem("adminToken")).toBe(adminToken);
    expect(JSON.parse(localStorage.getItem("adminData"))).toEqual(adminUser);
    expect(result).toMatchObject({ token: adminToken, user: adminUser });
  });

  it("rejects non-admin users and shows toast", async () => {
    const nonAdminUser = { ...adminUser, role: "customer" };
    axiosInstance.post.mockResolvedValueOnce({
      data: { data: { token: adminToken, user: nonAdminUser } },
    });

    const result = await authService.login("user@test.com", "password");

    expect(result.success).toBe(false);
    expect(toast.error).toHaveBeenCalledWith("ليس لديك صلاحية الدخول");
    expect(localStorage.getItem("adminToken")).toBeNull();
  });

  it("throws on API error", async () => {
    axiosInstance.post.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });

    await expect(
      authService.login("bad@test.com", "wrong")
    ).rejects.toMatchObject({ message: "Invalid credentials" });
  });
});

describe("authService.logout", () => {
  it("clears localStorage after logout", async () => {
    localStorage.setItem("adminToken", adminToken);
    localStorage.setItem("adminData", JSON.stringify(adminUser));
    axiosInstance.post.mockResolvedValueOnce({});

    await authService.logout();

    expect(localStorage.getItem("adminToken")).toBeNull();
    expect(localStorage.getItem("adminData")).toBeNull();
  });
});

describe("authService.getToken", () => {
  it("returns null when not authenticated", () => {
    expect(authService.getToken()).toBeNull();
  });

  it("returns the token stored in localStorage", () => {
    localStorage.setItem("adminToken", adminToken);
    expect(authService.getToken()).toBe(adminToken);
  });
});

describe("authService.getCurrentUser", () => {
  it("returns null when no user in storage", () => {
    expect(authService.getCurrentUser()).toBeNull();
  });

  it("returns parsed user object from localStorage", () => {
    localStorage.setItem("adminData", JSON.stringify(adminUser));
    expect(authService.getCurrentUser()).toEqual(adminUser);
  });
});

describe("authService.isAuthenticated", () => {
  it("returns false when no token", () => {
    expect(authService.isAuthenticated()).toBe(false);
  });

  it("returns true when token exists", () => {
    localStorage.setItem("adminToken", adminToken);
    expect(authService.isAuthenticated()).toBe(true);
  });
});
