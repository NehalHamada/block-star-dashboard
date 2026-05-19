import { cn } from "../cn";

describe("cn() – className utility", () => {
  it("returns a single class unchanged", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("merges multiple class strings", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("filters out falsy values", () => {
    expect(cn("text-sm", false, null, undefined, "font-bold")).toBe(
      "text-sm font-bold"
    );
  });

  it("handles conditional object syntax from clsx", () => {
    expect(cn({ "bg-red-500": true, "bg-blue-500": false })).toBe(
      "bg-red-500"
    );
  });

  it("resolves Tailwind conflicts (last wins via twMerge)", () => {
    // twMerge: px-4 overrides px-2
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("merges arrays", () => {
    expect(cn(["text-sm", "font-medium"])).toBe("text-sm font-medium");
  });

  it("returns empty string for no arguments", () => {
    expect(cn()).toBe("");
  });

  it("deduplicates conflicting background colors", () => {
    expect(cn("bg-red-500", "bg-green-500")).toBe("bg-green-500");
  });
});
