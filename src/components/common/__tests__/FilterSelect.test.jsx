import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FilterSelect from "../FilterSelect";

const options = [
  { value: "pending", label: "قيد الانتظار" },
  { value: "delivered", label: "تم التسليم" },
  { value: "cancelled", label: "ملغي" },
];

describe("FilterSelect component", () => {
  it("renders the label as the default empty option", () => {
    render(
      <FilterSelect label="كل الحالات" value="" onChange={vi.fn()} options={options} />
    );
    expect(screen.getByText("كل الحالات")).toBeInTheDocument();
  });

  it("renders all provided options", () => {
    render(
      <FilterSelect label="كل الحالات" value="" onChange={vi.fn()} options={options} />
    );
    expect(screen.getByText("قيد الانتظار")).toBeInTheDocument();
    expect(screen.getByText("تم التسليم")).toBeInTheDocument();
    expect(screen.getByText("ملغي")).toBeInTheDocument();
  });

  it("shows selected value", () => {
    render(
      <FilterSelect
        label="كل الحالات"
        value="pending"
        onChange={vi.fn()}
        options={options}
      />
    );
    const select = screen.getByRole("combobox");
    expect(select.value).toBe("pending");
  });

  it("calls onChange with the new value when selection changes", () => {
    const onChange = vi.fn();
    render(
      <FilterSelect label="كل الحالات" value="" onChange={onChange} options={options} />
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "delivered" },
    });
    expect(onChange).toHaveBeenCalledWith("delivered");
  });

  it("renders empty select when no options are provided", () => {
    render(
      <FilterSelect label="اختر" value="" onChange={vi.fn()} options={[]} />
    );
    // Only the label/default option should be present
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });
});
