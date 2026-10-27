import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isHoverable?: boolean;
  isGlass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  isHoverable = false,
  isGlass = true,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-200 border",
        isGlass
          ? "bg-[#121824]/80 backdrop-blur-xl border-white/[0.08]"
          : "bg-[#161F30] border-white/10",
        isHoverable &&
          "hover:border-white/20 hover:bg-[#161F30] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
