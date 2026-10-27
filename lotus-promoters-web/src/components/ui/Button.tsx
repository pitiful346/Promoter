import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#A3E635]/40 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const variants = {
      primary: "bg-[#A3E635] text-black font-semibold hover:bg-[#BEF264] shadow-[0_0_20px_-3px_rgba(163,230,53,0.35)] hover:shadow-[0_0_25px_-2px_rgba(163,230,53,0.5)] border border-[#BEF264]/40",
      secondary: "bg-[#161F30] text-[#F8FAFC] hover:bg-[#1F2B42] border border-white/10 hover:border-white/20 shadow-sm",
      outline: "bg-transparent text-[#F8FAFC] border border-white/15 hover:bg-white/5 hover:border-white/25",
      ghost: "bg-transparent text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5",
      danger: "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-6 py-3.5 gap-2.5",
      icon: "p-2.5 h-10 w-10",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
