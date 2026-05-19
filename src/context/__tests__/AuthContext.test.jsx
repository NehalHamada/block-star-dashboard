import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider } from "../AuthContext";
import { useAuth } from "../../hooks/useAuth";

// ─── Mock authService ─────────────────────────────────────────────────────────
vi.mock("../../services/authService", () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getToken: vi.fn(() => null),
    getCurrentUser: vi.fn(() => null),
    isAuthenticated: vi.fn(() => false),
  },
}));

vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

import { authService } from "../../services/authService";
import toast from "react-hot-toast";

// ─── Consumer component ───────────────────────────────────────────────────────
const TestConsumer = ({ onLogin, onLogout }) => {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <p data-testid="auth-state">{isAuthenticated ? "authenticated" : "guest"}</p>
      <p data-testid="user-name">{user?.name ?? "none"}</p>
      <button onClick={() => login("a@b.com", "pass").then(onLogin)}>
        تسجيل الدخول
      </button>
      <button onClick={() => { logout(); onLogout && onLogout(); }}>
        تسجيل الخروج
      </button>
    </div>
  );
};

const renderWithProvider = (onLogin = vi.fn(), onLogout = vi.fn()) =>
  render(
    <AuthProvider>
      <TestConsumer onLogin={onLogin} onLogout={onLogout} />
    </AuthProvider>
  );

describe("AuthContext + AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    authService.getToken.mockReturnValue(null);
    authService.getCurrentUser.mockReturnValue(null);
  });

  it("starts as unauthenticated with no user", () => {
    renderWithProvider();
    expect(screen.getByTestId("auth-state").textContent).toBe("guest");
    expect(screen.getByTestId("user-name").textContent).toBe("none");
  });

  it("reads persisted token and user from localStorage on mount", () => {
    const adminUser = { id: 1, name: "أحمد", role: "admin" };
    authService.getToken.mockReturnValue("persisted-token");
    authService.getCurrentUser.mockReturnValue(adminUser);

    renderWithProvider();

    expect(screen.getByTestId("auth-state").textContent).toBe("authenticated");
    expect(screen.getByTestId("user-name").textContent).toBe("أحمد");
  });

  it("updates state after successful login", async () => {
    const adminUser = { id: 2, name: "علي", role: "admin" };
    authService.login.mockResolvedValueOnce({ token: "new-token", user: adminUser });

    const onLogin = vi.fn();
    renderWithProvider(onLogin);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "تسجيل الدخول" }));
    });

    expect(screen.getByTestId("auth-state").textContent).toBe("authenticated");
    expect(onLogin).toHaveBeenCalled();
  });

  it("returns error when login fails", async () => {
    authService.login.mockRejectedValueOnce(new Error("Wrong credentials"));

    const onLogin = vi.fn();
    renderWithProvider(onLogin);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "تسجيل الدخول" }));
    });

    expect(onLogin).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(screen.getByTestId("auth-state").textContent).toBe("guest");
  });

  it("clears state after logout", async () => {
    const adminUser = { id: 1, name: "أحمد", role: "admin" };
    authService.getToken.mockReturnValue("token");
    authService.getCurrentUser.mockReturnValue(adminUser);
    authService.logout.mockResolvedValueOnce();

    renderWithProvider();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "تسجيل الخروج" }));
    });

    expect(screen.getByTestId("auth-state").textContent).toBe("guest");
    expect(screen.getByTestId("user-name").textContent).toBe("none");
  });
});

describe("useAuth outside AuthProvider", () => {
  it("throws an error when used outside AuthProvider", () => {
    // Suppress the expected React error output
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useAuth must be used within AuthProvider"
    );
    spy.mockRestore();
  });
});
