import * as React from "react";
import { Sparkles, AlertCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  confidence?: number;
  label?: string;
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  label,
  className,
}) => {
  if (confidence === undefined) return null;

  if (confidence >= 0.85) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30 shadow-[0_0_8px_rgba(163,230,53,0.2)]",
          className
        )}
        title={`Confiança da IA: ${Math.round(confidence * 100)}%`}
      >
        <Sparkles className="w-2.5 h-2.5" />
        <span>{label || `IA: ${Math.round(confidence * 100)}%`}</span>
      </span>
    );
  }

  if (confidence >= 0.4) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30",
          className
        )}
        title={`Confiança moderada: ${Math.round(confidence * 100)}%. Confirma este valor.`}
      >
        <AlertCircle className="w-2.5 h-2.5" />
        <span>{label || "Rever valor"}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1E293B] text-[#94A3B8] border border-white/10",
        className
      )}
      title="Não identificado no cartaz pela IA."
    >
      <HelpCircle className="w-2.5 h-2.5" />
      <span>{label || "Não detetado"}</span>
    </span>
  );
};
