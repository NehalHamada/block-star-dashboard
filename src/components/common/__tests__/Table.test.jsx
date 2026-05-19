import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Table, { TableRow, TableCell } from "../Table";

describe("Table component", () => {
  const headers = ["الاسم", "السعر", "الحالة"];

  it("renders all header columns", () => {
    render(<Table headers={headers}><tr /></Table>);
    headers.forEach((h) => expect(screen.getByText(h)).toBeInTheDocument());
  });

  it("renders children inside tbody", () => {
    render(
      <Table headers={headers}>
        <TableRow>
          <TableCell>كرسي خشبي</TableCell>
          <TableCell>250</TableCell>
          <TableCell>متاح</TableCell>
        </TableRow>
      </Table>
    );
    expect(screen.getByText("كرسي خشبي")).toBeInTheDocument();
    expect(screen.getByText("250")).toBeInTheDocument();
    expect(screen.getByText("متاح")).toBeInTheDocument();
  });

  it("renders multiple rows", () => {
    render(
      <Table headers={headers}>
        <TableRow><TableCell>منتج 1</TableCell></TableRow>
        <TableRow><TableCell>منتج 2</TableCell></TableRow>
      </Table>
    );
    expect(screen.getByText("منتج 1")).toBeInTheDocument();
    expect(screen.getByText("منتج 2")).toBeInTheDocument();
  });

  it("applies custom className to table", () => {
    const { container } = render(
      <Table headers={headers} className="custom-table"><tr /></Table>
    );
    expect(container.querySelector("table").className).toContain("custom-table");
  });
});

describe("TableRow component", () => {
  it("renders children", () => {
    render(
      <table><tbody>
        <TableRow><td>محتوى</td></TableRow>
      </tbody></table>
    );
    expect(screen.getByText("محتوى")).toBeInTheDocument();
  });

  it("applies extra className", () => {
    const { container } = render(
      <table><tbody>
        <TableRow className="bg-red-50"><td>x</td></TableRow>
      </tbody></table>
    );
    expect(container.querySelector("tr").className).toContain("bg-red-50");
  });
});

describe("TableCell component", () => {
  it("renders children", () => {
    render(
      <table><tbody><tr>
        <TableCell>قيمة الخلية</TableCell>
      </tr></tbody></table>
    );
    expect(screen.getByText("قيمة الخلية")).toBeInTheDocument();
  });

  it("applies extra className", () => {
    const { container } = render(
      <table><tbody><tr>
        <TableCell className="text-red-500">x</TableCell>
      </tr></tbody></table>
    );
    expect(container.querySelector("td").className).toContain("text-red-500");
  });
});
