import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ModalShell from "../ModalShell";

describe("ModalShell component", () => {
  it("renders modal title", () => {
    render(<ModalShell title="إضافة منتج" onClose={vi.fn()}><p>محتوى</p></ModalShell>);
    expect(screen.getByText("إضافة منتج")).toBeInTheDocument();
  });

  it("renders modal subtitle when provided", () => {
    render(<ModalShell title="عنوان" subtitle="وصف قصير" onClose={vi.fn()}><p>محتوى</p></ModalShell>);
    expect(screen.getByText("وصف قصير")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(<ModalShell title="عنوان" onClose={vi.fn()}><p>محتوى المودال</p></ModalShell>);
    expect(screen.getByText("محتوى المودال")).toBeInTheDocument();
  });

  it("calls onClose when the X button is clicked", () => {
    const onClose = vi.fn();
    render(<ModalShell title="عنوان" onClose={onClose}><p>محتوى</p></ModalShell>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render header when neither title nor onClose is provided", () => {
    render(<ModalShell><p>محتوى</p></ModalShell>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders headerActions when provided", () => {
    render(
      <ModalShell title="عنوان" onClose={vi.fn()} headerActions={<button>طباعة</button>}>
        <p>محتوى</p>
      </ModalShell>
    );
    expect(screen.getByRole("button", { name: "طباعة" })).toBeInTheDocument();
  });

  it("applies maxWidth class to the card", () => {
    const { container } = render(
      <ModalShell title="عنوان" onClose={vi.fn()} maxWidth="max-w-2xl"><p>محتوى</p></ModalShell>
    );
    expect(container.querySelector(".max-w-2xl")).toBeInTheDocument();
  });
});
