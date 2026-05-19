import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import EmptyState from "../EmptyState";
import { Package } from "lucide-react";

describe("EmptyState component", () => {
  it("renders the message text", () => {
    render(<EmptyState message="لا توجد منتجات" />);
    expect(screen.getByText("لا توجد منتجات")).toBeInTheDocument();
  });

  it("renders with an icon when icon prop is provided", () => {
    const { container } = render(
      <EmptyState icon={Package} message="لا توجد منتجات" />
    );
    // lucide-react renders an SVG
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("does not render an svg when icon prop is absent", () => {
    const { container } = render(<EmptyState message="لا توجد بيانات" />);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("renders with custom iconSize", () => {
    const { container } = render(
      <EmptyState icon={Package} message="لا توجد بيانات" iconSize={48} />
    );
    const svg = container.querySelector("svg");
    // lucide sets width/height attributes equal to the size prop
    expect(svg).toBeInTheDocument();
  });
});
