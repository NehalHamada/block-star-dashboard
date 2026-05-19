import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Pagination from "../Pagination";

describe("Pagination component", () => {
  it("renders nothing when lastPage <= 1", () => {
    const { container } = render(
      <Pagination currentPage={1} lastPage={1} onPrev={vi.fn()} onNext={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders page info text", () => {
    render(
      <Pagination currentPage={2} lastPage={5} onPrev={vi.fn()} onNext={vi.fn()} />
    );
    expect(screen.getByText(/صفحة 2 من 5/)).toBeInTheDocument();
  });

  it("disables Prev button on first page", () => {
    const onPrev = vi.fn();
    render(
      <Pagination currentPage={1} lastPage={3} onPrev={onPrev} onNext={vi.fn()} />
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled(); // ChevronRight (Prev in RTL)
  });

  it("disables Next button on last page", () => {
    const onNext = vi.fn();
    render(
      <Pagination currentPage={3} lastPage={3} onPrev={vi.fn()} onNext={onNext} />
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons[1]).toBeDisabled(); // ChevronLeft (Next in RTL)
  });

  it("calls onPrev when prev button is clicked", () => {
    const onPrev = vi.fn();
    render(
      <Pagination currentPage={2} lastPage={5} onPrev={onPrev} onNext={vi.fn()} />
    );
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it("calls onNext when next button is clicked", () => {
    const onNext = vi.fn();
    render(
      <Pagination currentPage={1} lastPage={5} onPrev={vi.fn()} onNext={onNext} />
    );
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]);
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
