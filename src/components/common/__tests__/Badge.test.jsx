import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Badge from "../Badge";

describe("Badge component", () => {
  it("renders children text", () => {
    render(<Badge>مكتمل</Badge>);
    expect(screen.getByText("مكتمل")).toBeInTheDocument();
  });

  it("renders default variant with correct classes", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default").className).toContain("rounded-full");
  });

  it("renders success variant", () => {
    render(<Badge variant="success">نجاح</Badge>);
    expect(screen.getByText("نجاح").className).toContain("bg-green-100");
    expect(screen.getByText("نجاح").className).toContain("text-green-800");
  });

  it("renders warning variant", () => {
    render(<Badge variant="warning">تحذير</Badge>);
    expect(screen.getByText("تحذير").className).toContain("bg-yellow-100");
  });

  it("renders danger variant", () => {
    render(<Badge variant="danger">خطأ</Badge>);
    expect(screen.getByText("خطأ").className).toContain("bg-red-100");
    expect(screen.getByText("خطأ").className).toContain("text-red-800");
  });

  it("renders info variant", () => {
    render(<Badge variant="info">معلومات</Badge>);
    expect(screen.getByText("معلومات").className).toContain("bg-blue-100");
  });

  it("merges extra className", () => {
    render(<Badge className="extra-class">Badge</Badge>);
    expect(screen.getByText("Badge").className).toContain("extra-class");
  });
});
