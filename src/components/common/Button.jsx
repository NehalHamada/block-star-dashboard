import { cn } from "../../utils/cn";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}) => {
  const variants = {
    primary: "bg-secondary hover:bg-secondary/90 text-white",
    secondary: "bg-primary hover:bg-primary/90 text-white",
    outline: "border border-light-gray text-dark-gray hover:bg-light-beige",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    ghost: "text-dark-gray hover:bg-light-beige hover:text-primary",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
