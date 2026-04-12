import React from "react";
import { Loader2 } from "lucide-react";

const Button = ({
  children,
  as = "button",
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  className = "",
  disabled,
  ...props
}) => {
  const componentTag = as;
  const baseStyles =
    "inline-flex cursor-pointer items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5",
    secondary:
      "bg-white text-emerald-800 border-2 border-emerald-600 hover:bg-emerald-50 focus:ring-emerald-500",
    outline:
      "bg-transparent text-slate-600 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-5 py-2.5 text-base rounded-xl",
    lg: "px-6 py-3.2 text-lg rounded-xl",
  };

  return React.createElement(
    componentTag,
    {
      className: `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`,
      disabled: disabled || isLoading,
      "aria-busy": isLoading,
      ...props,
    },
    isLoading ? (
      <span className="inline-flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        {loadingText || children}
      </span>
    ) : (
      children
    ),
  );
};

export default Button;
