"use client";

import * as React from "react";
import { LotusEvent } from "@/core/domain/event";
import { MobileEventCard } from "./MobileEventCard";
import { Smartphone, LayoutGrid, FileText, Wifi, Battery, Signal } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveMobilePreviewProps {
  event: Partial<LotusEvent>;
  organizerName?: string;
  className?: string;
}

export const LiveMobilePreview: React.FC<LiveMobilePreviewProps> = ({
  event,
  organizerName,
  className,
}) => {
  const [viewMode, setViewMode] = React.useState<"card" | "detail">("detail");

  return (
    <div className={cn("flex flex-col items-center sticky top-24", className)}>
      {/* Header controls */}
      <div className="w-full max-w-[340px] flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8]">
          <Smartphone className="w-4 h-4 text-[#A3E635]" />
          <span>Lotus Mobile Preview</span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-[#121824] p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setViewMode("card")}
            className={cn(
              "p-1 rounded text-xs transition-colors",
              viewMode === "card"
                ? "bg-[#1E293B] text-[#A3E635] font-semibold"
                : "text-[#64748B] hover:text-white"
            )}
            title="Vista Card (Feed)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode("detail")}
            className={cn(
              "p-1 rounded text-xs transition-colors",
              viewMode === "detail"
                ? "bg-[#1E293B] text-[#A3E635] font-semibold"
                : "text-[#64748B] hover:text-white"
            )}
            title="Vista Detalhe"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Phone Mockup Frame */}
      <div className="w-[340px] bg-black rounded-[42px] p-3 border-[6px] border-[#1F293D] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative overflow-hidden ring-1 ring-white/10">
        {/* Dynamic Island / Top Notch */}
        <div className="w-24 h-4 bg-[#1F293D] rounded-full mx-auto mb-2 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-black/80" />
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 pb-2 text-[10px] text-[#94A3B8] font-medium">
          <span>22:00</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Inner Phone Screen Content */}
        <div className="bg-[#0B0E14] rounded-[28px] p-2.5 overflow-y-auto max-h-[520px] scrollbar-none border border-white/5">
          <MobileEventCard
            event={event}
            organizerName={organizerName}
            viewMode={viewMode}
          />
        </div>

        {/* Home Indicator Bar */}
        <div className="w-28 h-1 bg-white/20 rounded-full mx-auto mt-2" />
      </div>

      <p className="text-[11px] text-[#64748B] mt-3 text-center">
        Atualização dinâmica em tempo real
      </p>
    </div>
  );
};
