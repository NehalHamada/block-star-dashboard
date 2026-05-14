import { cn } from "../../utils/cn";

const Table = ({ headers, children, className }) => {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-left border-collapse", className)}>
        <thead>
          <tr className="border-b border-light-gray/20">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-4 text-xs font-semibold text-dark-gray uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-light-gray/10">{children}</tbody>
      </table>
    </div>
  );
};

export const TableRow = ({ children, className, ...props }) => (
  <tr
    className={cn("hover:bg-light-beige/50 transition-colors", className)}
    {...props}
  >
    {children}
  </tr>
);

export const TableCell = ({ children, className, ...props }) => (
  <td
    className={cn(
      "px-6 py-4 text-sm text-text-black whitespace-nowrap",
      className,
    )}
    {...props}
  >
    {children}
  </td>
);

export default Table;
