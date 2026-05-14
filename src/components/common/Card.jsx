import { cn } from "../../utils/cn";

const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm border border-light-gray/20 overflow-hidden",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }) => (
  <div
    className={cn("px-6 py-4 border-b border-light-gray/20", className)}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }) => (
  <h3
    className={cn("text-lg font-semibold text-text-black", className)}
    {...props}
  >
    {children}
  </h3>
);

export const CardContent = ({ children, className, ...props }) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
);

export default Card;
