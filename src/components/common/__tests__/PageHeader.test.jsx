import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PageHeader from "../PageHeader";

describe("PageHeader component", () => {
  it("renders title text", () => {
    render(<PageHeader title="الطلبات" />);
    expect(screen.getByRole("heading", { name: "الطلبات" })).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<PageHeader title="الطلبات" subtitle="إجمالي 30 طلب" />);
    expect(screen.getByText("إجمالي 30 طلب")).toBeInTheDocument();
  });

  it("does not render subtitle element when subtitle is absent", () => {
    render(<PageHeader title="الطلبات" />);
    expect(screen.queryByText("إجمالي 30 طلب")).not.toBeInTheDocument();
  });

  it("renders children (action buttons area)", () => {
    render(
      <PageHeader title="الطلبات">
        <button>إضافة</button>
      </PageHeader>
    );
    expect(screen.getByRole("button", { name: "إضافة" })).toBeInTheDocument();
  });

  it("does not render the children wrapper when no children", () => {
    const { container } = render(<PageHeader title="الطلبات" />);
    // The wrapper div for children should not be present
    const flexDiv = container.querySelector(".flex.items-center.gap-2");
    expect(flexDiv).not.toBeInTheDocument();
  });
});
