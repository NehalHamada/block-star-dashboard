import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ConfirmModal from "../ConfirmModal";

describe("ConfirmModal component", () => {
  const defaultProps = {
    title: "تأكيد الحذف",
    message: "هل أنت متأكد؟",
    confirmLabel: "حذف",
    cancelLabel: "إلغاء",
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
    danger: true,
  };

  it("renders title text", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText("تأكيد الحذف")).toBeInTheDocument();
  });

  it("renders message text", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText("هل أنت متأكد؟")).toBeInTheDocument();
  });

  it("renders confirm and cancel buttons", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByRole("button", { name: "حذف" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "إلغاء" })).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole("button", { name: "حذف" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(<ConfirmModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: "إلغاء" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("applies danger red background when danger=true", () => {
    render(<ConfirmModal {...defaultProps} danger={true} />);
    const confirmBtn = screen.getByRole("button", { name: "حذف" });
    expect(confirmBtn.className).toContain("bg-red-500");
  });

  it("applies secondary background when danger=false", () => {
    render(<ConfirmModal {...defaultProps} danger={false} />);
    const confirmBtn = screen.getByRole("button", { name: "حذف" });
    expect(confirmBtn.className).toContain("bg-secondary");
  });

  it("does not render message when message prop is absent", () => {
    const props = { ...defaultProps, message: undefined };
    render(<ConfirmModal {...props} />);
    expect(screen.queryByText("هل أنت متأكد؟")).not.toBeInTheDocument();
  });

  it("uses default title 'تأكيد' when no title is provided", () => {
    render(
      <ConfirmModal
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        confirmLabel="موافق"
        cancelLabel="إلغاء"
      />
    );
    expect(screen.getByText("تأكيد")).toBeInTheDocument();
  });
});
