import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "w-full bg-[#121824] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#64748B] transition-all duration-200 resize-y min-h-[100px]",
            "focus:outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]/50 focus:bg-[#161F30]",
            "hover:border-white/20",
            error && "border-red-500/60 focus:border-red-500 focus:ring-red-500/30",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-400 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#64748B]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
