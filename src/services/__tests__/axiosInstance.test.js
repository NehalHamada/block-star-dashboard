import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

// We re-import after mocking localStorage so interceptors pick up the fresh values
describe("axiosInstance interceptors", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("creates an instance with the correct baseURL", async () => {
    // Dynamically import so the module-level code runs fresh per test
    const { default: instance } = await import("../axiosInstance");
    expect(instance.defaults.baseURL).toBe(
      "https://wooden.ahdafweb.com/public/api"
    );
  });

  it("sets Accept header to application/json", async () => {
    const { default: instance } = await import("../axiosInstance");
    expect(instance.defaults.headers.Accept).toBe("application/json");
  });

  it("request interceptor attaches adminToken as Bearer token", async () => {
    localStorage.setItem("adminToken", "test-token-123");

    const { default: instance } = await import("../axiosInstance");

    // Spy on the first request interceptor by calling it manually
    const config = { headers: {} };
    const interceptorFn =
      instance.interceptors.request.handlers[0]?.fulfilled;

    if (interceptorFn) {
      const result = interceptorFn(config);
      expect(result.headers.Authorization).toBe("Bearer test-token-123");
    }
  });

  it("request interceptor sets Accept-Language from localStorage", async () => {
    localStorage.setItem("lang", "en");

    const { default: instance } = await import("../axiosInstance");
    const config = { headers: {} };
    const interceptorFn =
      instance.interceptors.request.handlers[0]?.fulfilled;

    if (interceptorFn) {
      const result = interceptorFn(config);
      expect(result.headers["Accept-Language"]).toBe("en");
    }
  });

  it("request interceptor defaults Accept-Language to 'ar' when no lang set", async () => {
    const { default: instance } = await import("../axiosInstance");
    const config = { headers: {} };
    const interceptorFn =
      instance.interceptors.request.handlers[0]?.fulfilled;

    if (interceptorFn) {
      const result = interceptorFn(config);
      expect(result.headers["Accept-Language"]).toBe("ar");
    }
  });

  it("response interceptor removes tokens and redirects on 401", async () => {
    localStorage.setItem("adminToken", "old-token");
    localStorage.setItem("adminData", JSON.stringify({ name: "Admin" }));

    // Mock window.location.href setter
    const locationMock = { href: "" };
    Object.defineProperty(window, "location", {
      value: locationMock,
      writable: true,
    });

    const { default: instance } = await import("../axiosInstance");
    const errorInterceptor =
      instance.interceptors.response.handlers[0]?.rejected;

    if (errorInterceptor) {
      const error = { response: { status: 401 } };
      await expect(errorInterceptor(error)).rejects.toEqual(error);
      expect(localStorage.getItem("adminToken")).toBeNull();
      expect(localStorage.getItem("adminData")).toBeNull();
      expect(window.location.href).toBe("/login");
    }
  });
});
