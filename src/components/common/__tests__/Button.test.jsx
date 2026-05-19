import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Button from "../Button";

describe("Button component", () => {
  it("renders children text", () => {
    render(<Button>إضافة</Button>);
    expect(screen.getByRole("button", { name: "إضافة" })).toBeInTheDocument();
  });

  it("renders with default primary variant classes", () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-secondary");
  });

  it("renders danger variant", () => {
    render(<Button variant="danger">حذف</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-red-500");
  });

  it("renders outline variant", () => {
    render(<Button variant="outline">إلغاء</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("border");
  });

  it("renders ghost variant", () => {
    render(<Button variant="ghost">تعديل</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("text-dark-gray");
  });

  it("renders small size", () => {
    render(<Button size="sm">صغير</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("px-3");
  });

  it("renders large size", () => {
    render(<Button size="lg">كبير</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("px-6");
  });

  it("calls onClick handler when clicked", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>زر</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is passed", () => {
    render(<Button disabled>زر</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies extra className prop", () => {
    render(<Button className="my-custom-class">زر</Button>);
    expect(screen.getByRole("button").className).toContain("my-custom-class");
  });

  it("renders icon size variant", () => {
    render(<Button size="icon">🗑</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("p-2");
  });
});
