"use client";

import * as React from "react";
import { LotusTeaser } from "@/core/domain/teaser";
import { LotusEvent } from "@/core/domain/event";
import { useOrgStore } from "@/stores/useOrgStore";
import { calculateTimeRemaining, CountdownTime } from "@/lib/countdown";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";
import {
  Clock,
  Sparkles,
  ShieldCheck,
  MapPin,
  Ticket,
  ExternalLink,
  Zap,
} from "lucide-react";


interface LiveRevealCountdownPreviewProps {
  teaser: Partial<LotusTeaser>;
  linkedEvent?: Partial<LotusEvent> | null;
  className?: string;
  onRevealTrigger?: () => void;
}

export const LiveRevealCountdownPreview: React.FC<LiveRevealCountdownPreviewProps> = ({
  teaser,
  linkedEvent,
  className,
  onRevealTrigger,
}) => {
  const { getActiveOrg } = useOrgStore();
  const activeOrg = getActiveOrg();

  const [countdown, setCountdown] = React.useState<CountdownTime>(() =>
    calculateTimeRemaining(teaser.reveal_at || "2026-10-15T18:00:00Z")
  );
  const [forceRevealed, setForceRevealed] = React.useState<boolean>(
    teaser.status === "REVEALED"
  );

  // Update countdown second-by-second on client
  React.useEffect(() => {
    if (forceRevealed || teaser.status === "REVEALED") {
      return;
    }

    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(teaser.reveal_at || "2026-10-15T18:00:00Z");
      setCountdown(remaining);
      if (remaining.isRevealed) {
        setForceRevealed(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [teaser.reveal_at, forceRevealed, teaser.status]);


  const isActuallyRevealed = forceRevealed || teaser.status === "REVEALED";

  return (
    <div className={cn("flex flex-col items-center sticky top-24", className)}>
      {/* Header controls & Mode Switch */}
      <div className="w-full max-w-[360px] flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8]">
          <Clock className="w-4 h-4 text-[#A3E635]" />
          <span>Simulador de Reveal</span>
        </div>
        
        {/* Toggle Mode Button */}
        <button
          type="button"
          onClick={() => {
            const next = !isActuallyRevealed;
            setForceRevealed(next);
            if (next && onRevealTrigger) onRevealTrigger();
          }}
          className={cn(
            "text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 cursor-pointer",
            isActuallyRevealed
              ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
              : "bg-[#A3E635]/20 text-[#A3E635] border-[#A3E635]/40"
          )}
        >
          <Zap className="w-3 h-3" />
          <span>{isActuallyRevealed ? "Ver Modo Teaser" : "Testar Reveal"}</span>
        </button>
      </div>

      {/* Phone Frame */}
      <div className="w-[360px] bg-black rounded-[44px] p-3 border-[6px] border-[#1F293D] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative overflow-hidden ring-1 ring-white/10">
        {/* Notch */}
        <div className="w-24 h-4 bg-[#1F293D] rounded-full mx-auto mb-2 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-black/80" />
        </div>

        {/* Screen Content */}
        <div className="bg-[#0B0E14] rounded-[30px] overflow-y-auto max-h-[580px] scrollbar-none border border-white/5 text-left text-white p-4 space-y-4">
          {!isActuallyRevealed ? (
            /* PRE-REVEAL: Mystery Card + Countdown */
            <div className="rounded-2xl bg-[#121824] border border-[#A3E635]/30 overflow-hidden shadow-2xl space-y-3">
              {/* Header */}
              <div className="p-3 bg-[#161F30] border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0B0E14] overflow-hidden border border-white/10 shrink-0">
                    <img
                      src={activeOrg?.logo_url || "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=150"}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    {activeOrg?.name || "Sublime Productions"}
                    <ShieldCheck className="w-3.5 h-3.5 text-[#A3E635]" />
                  </span>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#A3E635]/20 text-[#A3E635] border border-[#A3E635]/40">
                  Radar Oficial
                </span>
              </div>

              {/* Artwork */}
              <div className="relative w-full aspect-[4/5] bg-black overflow-hidden">
                <img
                  src={teaser.image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800"}
                  alt="Teaser"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121824] via-transparent to-black/30" />

                {/* Big Flip Countdown Box */}
                <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-xl bg-black/85 backdrop-blur-md border border-[#A3E635]/50 text-center space-y-2 shadow-2xl">
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#A3E635]">
                    <Clock className="w-3 h-3 text-[#A3E635] animate-spin" />
                    <span>Reveal Oficial Em</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                    <div className="bg-[#121824] p-1 rounded-lg border border-white/10">
                      <span className="text-sm font-black text-white block">
                        {String(countdown.days).padStart(2, "0")}
                      </span>
                      <span className="text-[8px] text-[#64748B] uppercase block">Dias</span>
                    </div>
                    <div className="bg-[#121824] p-1 rounded-lg border border-white/10">
                      <span className="text-sm font-black text-white block">
                        {String(countdown.hours).padStart(2, "0")}
                      </span>
                      <span className="text-[8px] text-[#64748B] uppercase block">Horas</span>
                    </div>
                    <div className="bg-[#121824] p-1 rounded-lg border border-white/10">
                      <span className="text-sm font-black text-white block">
                        {String(countdown.minutes).padStart(2, "0")}
                      </span>
                      <span className="text-[8px] text-[#64748B] uppercase block">Min</span>
                    </div>
                    <div className="bg-[#121824] p-1 rounded-lg border border-[#A3E635]/30">
                      <span className="text-sm font-black text-[#A3E635] block animate-pulse">
                        {String(countdown.seconds).padStart(2, "0")}
                      </span>
                      <span className="text-[8px] text-[#64748B] uppercase block">Seg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Copy */}
              <div className="p-4 pt-1 space-y-2">
                <h4 className="text-base font-black text-white uppercase tracking-tight">
                  {teaser.title || teaser.codename || "SOMETHING IS COMING"}
                </h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {teaser.description}
                </p>
                <div className="pt-2">
                  <span className="text-[10px] text-[#64748B] block">
                    🔔 {teaser.tracking_count || 842} pessoas vão receber notificação instantânea.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* POST-REVEAL: Full Official Event Card */
            <div className="rounded-2xl bg-[#121824] border border-purple-500/40 overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.25)] space-y-3 animate-fade-in">
              {/* Revealed Badge Header */}
              <div className="p-3 bg-gradient-to-r from-purple-950/80 to-[#121824] border-b border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                  <span>REVELADO NO LOTUS RADAR</span>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Bilhetes Ativos
                </span>
              </div>

              {/* Event Final Poster */}
              <div className="relative w-full aspect-[16/9] bg-black overflow-hidden">
                <img
                  src={
                    linkedEvent?.image ||
                    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800"
                  }
                  alt={linkedEvent?.name || "Revealed Event"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121824] via-transparent to-transparent" />
              </div>

              {/* Final Details */}
              <div className="p-4 pt-0 space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-[#A3E635] uppercase tracking-wider block">
                    {linkedEvent?.start_date ? formatDateTime(linkedEvent.start_date) : "31 OUTUBRO 2026 · 23:00"}
                  </span>
                  <h4 className="text-lg font-black text-white tracking-tight mt-0.5">
                    {linkedEvent?.name || "Sublime Festival 2026 (Revelado)"}
                  </h4>
                </div>

                <div className="space-y-1.5 text-xs text-[#CBD5E1]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#A3E635]" />
                    <span>{linkedEvent?.venue_name || "Pavilhão Carlos Lopes, Lisboa"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-3.5 h-3.5 text-[#A3E635]" />
                    <span>
                      A partir de {formatCurrency(linkedEvent?.price_min || 25, linkedEvent?.is_free)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2">
                  {linkedEvent?.description ||
                    "O evento oficial foi agora destrancado no ecossistema Lotus! Bilhetes disponíveis."}
                </p>

                {/* Ticket Button */}
                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl bg-[#A3E635] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(163,230,53,0.35)] hover:bg-[#BEF264] transition-all cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Comprar Bilhetes</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Home Indicator */}
        <div className="w-28 h-1 bg-white/20 rounded-full mx-auto mt-2" />
      </div>

      <p className="text-[11px] text-[#64748B] mt-3 text-center">
        {isActuallyRevealed
          ? "✨ Visualização pública após o reveal oficial"
          : "⏳ Visualização pública durante a contagem decrescente"}
      </p>
    </div>
  );
};
