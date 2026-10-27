import * as React from "react";
import { EventStatus } from "@/core/domain/event";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: EventStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  EventStatus,
  { label: string; bg: string; text: string; border: string; dot: string; glow: string }
> = {
  PUBLISHED: {
    label: "Publicado",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
    glow: "shadow-[0_0_8px_rgba(52,211,153,0.6)]",
  },
  DRAFT: {
    label: "Rascunho",
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/30",
    dot: "bg-slate-400",
    glow: "",
  },
  SUBMITTED: {
    label: "Em Revisão",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
    glow: "shadow-[0_0_8px_rgba(251,191,36,0.6)]",
  },
  CANCELLED: {
    label: "Cancelado",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/30",
    dot: "bg-rose-400",
    glow: "",
  },
  REJECTED: {
    label: "Rejeitado",
    bg: "bg-rose-500/15",
    text: "text-rose-300",
    border: "border-rose-500/40",
    dot: "bg-rose-500",
    glow: "",
  },
  ARCHIVED: {
    label: "Arquivado",
    bg: "bg-zinc-800/40",
    text: "text-zinc-400",
    border: "border-zinc-700/40",
    dot: "bg-zinc-500",
    glow: "",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", config.dot, config.glow)} />
      {config.label}
    </span>
  );
};
