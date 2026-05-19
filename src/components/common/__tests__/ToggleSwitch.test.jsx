import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ToggleSwitch from "../ToggleSwitch";

describe("ToggleSwitch component", () => {
  it("renders the label text", () => {
    render(<ToggleSwitch checked={false} onChange={vi.fn()} label="تفعيل" />);
    expect(screen.getByText("تفعيل")).toBeInTheDocument();
  });

  it("does not render label element when no label is provided", () => {
    render(<ToggleSwitch checked={false} onChange={vi.fn()} />);
    expect(screen.queryByRole("span")).not.toBeInTheDocument();
  });

  it("applies active background color when checked=true", () => {
    render(<ToggleSwitch checked={true} onChange={vi.fn()} label="تفعيل" />);
    // The track div has bg-secondary when checked
    const track = screen.getByText("تفعيل").closest("label").querySelector("div");
    expect(track.className).toContain("bg-secondary");
  });

  it("applies inactive background color when checked=false", () => {
    render(<ToggleSwitch checked={false} onChange={vi.fn()} label="تفعيل" />);
    const track = screen.getByText("تفعيل").closest("label").querySelector("div");
    expect(track.className).toContain("bg-gray-200");
  });

  it("calls onChange when the track is clicked", () => {
    const onChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={onChange} label="تفعيل" />);
    const track = screen.getByText("تفعيل").closest("label").querySelector("div");
    fireEvent.click(track);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("thumb translates right when checked=true", () => {
    render(<ToggleSwitch checked={true} onChange={vi.fn()} label="تفعيل" />);
    const track = screen.getByText("تفعيل").closest("label").querySelector("div");
    const thumb = track.querySelector("div");
    expect(thumb.className).toContain("translate-x-5");
  });

  it("thumb stays left when checked=false", () => {
    render(<ToggleSwitch checked={false} onChange={vi.fn()} label="تفعيل" />);
    const track = screen.getByText("تفعيل").closest("label").querySelector("div");
    const thumb = track.querySelector("div");
    expect(thumb.className).toContain("translate-x-0.5");
  });
});
