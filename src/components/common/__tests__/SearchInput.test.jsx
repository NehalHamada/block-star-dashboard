import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SearchInput from "../SearchInput";

describe("SearchInput component", () => {
  it("renders with default placeholder", () => {
    render(<SearchInput value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText("بحث...")).toBeInTheDocument();
  });

  it("renders with custom placeholder", () => {
    render(<SearchInput value="" onChange={vi.fn()} placeholder="ابحث عن منتج" />);
    expect(screen.getByPlaceholderText("ابحث عن منتج")).toBeInTheDocument();
  });

  it("renders with controlled value", () => {
    render(<SearchInput value="كرسي" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("كرسي")).toBeInTheDocument();
  });

  it("calls onChange when user types", () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "طاولة" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("applies custom className to wrapper", () => {
    const { container } = render(
      <SearchInput value="" onChange={vi.fn()} className="w-64" />
    );
    expect(container.firstChild.className).toContain("w-64");
  });
});
