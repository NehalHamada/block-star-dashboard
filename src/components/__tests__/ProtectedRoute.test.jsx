import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";
import { AuthContext } from "../../context/authContextDef";

// ─── Helper: wraps ProtectedRoute in a router + AuthContext ───────────────────
const renderWithAuth = (isAuthenticated, loading = false) => {
  const contextValue = { isAuthenticated, loading, user: null, token: null };
  return render(
    <AuthContext.Provider value={contextValue}>
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>محتوى محمي</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>صفحة تسجيل الدخول</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe("ProtectedRoute component", () => {
  it("renders children when user is authenticated", () => {
    renderWithAuth(true);
    expect(screen.getByText("محتوى محمي")).toBeInTheDocument();
  });

  it("redirects to /login when user is not authenticated", () => {
    renderWithAuth(false);
    expect(screen.getByText("صفحة تسجيل الدخول")).toBeInTheDocument();
    expect(screen.queryByText("محتوى محمي")).not.toBeInTheDocument();
  });

  it("shows loading spinner when loading=true", () => {
    renderWithAuth(false, true);
    expect(screen.getByText("جاري التحميل...")).toBeInTheDocument();
    expect(screen.queryByText("محتوى محمي")).not.toBeInTheDocument();
  });

  it("does not show loading text when loading=false and authenticated", () => {
    renderWithAuth(true, false);
    expect(screen.queryByText("جاري التحميل...")).not.toBeInTheDocument();
  });
});
