import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatCard from "../StatCard";
import { ShoppingCart } from "lucide-react";

describe("StatCard component", () => {
  const defaultProps = {
    name: "إجمالي الطلبات",
    icon: ShoppingCart,
    value: 128,
    color: "#4f46e5",
  };

  it("renders the name text", () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText("إجمالي الطلبات")).toBeInTheDocument();
  });

  it("renders the value", () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText("128")).toBeInTheDocument();
  });

  it("renders the icon as an SVG", () => {
    const { container } = render(<StatCard {...defaultProps} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders a zero value", () => {
    render(<StatCard {...defaultProps} value={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders a string value", () => {
    render(<StatCard {...defaultProps} value="1,500 ج.م" />);
    expect(screen.getByText("1,500 ج.م")).toBeInTheDocument();
  });
});
