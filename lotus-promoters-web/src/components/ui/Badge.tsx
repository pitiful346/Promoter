import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "lime" | "outline" | "secondary" | "danger" | "warning";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  size = "sm",
  children,
  ...props
}) => {
  const variants = {
    default: "bg-[#1E293B] text-[#94A3B8] border border-white/10",
    lime: "bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30 shadow-[0_0_10px_-2px_rgba(163,230,53,0.2)]",
    secondary: "bg-[#161F30] text-[#F8FAFC] border border-white/10",
    outline: "bg-transparent text-[#94A3B8] border border-white/15",
    danger: "bg-red-500/15 text-red-400 border border-red-500/30",
    warning: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5 rounded-md font-medium tracking-wide",
    md: "text-xs px-2.5 py-1 rounded-lg font-medium",
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap", variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
