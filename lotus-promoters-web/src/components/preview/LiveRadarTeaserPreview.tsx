"use client";

import * as React from "react";
import { LotusTeaser } from "@/core/domain/teaser";
import { useOrgStore } from "@/stores/useOrgStore";
import { formatDateTime, cn } from "@/lib/utils";
import {
  Radio,
  Clock,
  ShieldCheck,
  Check,
  Bell,
} from "lucide-react";


interface LiveRadarTeaserPreviewProps {
  teaser: Partial<LotusTeaser>;
  className?: string;
}

export const LiveRadarTeaserPreview: React.FC<LiveRadarTeaserPreviewProps> = ({
  teaser,
  className,
}) => {
  const { getActiveOrg } = useOrgStore();
  const activeOrg = getActiveOrg();

  const [isTracking, setIsTracking] = React.useState(false);
  const baseCount = teaser.tracking_count || 842;
  const currentCount = baseCount + (isTracking ? 1 : 0);

  const calculateTime = React.useCallback(() => {
    const targetDate = teaser.reveal_at
      ? new Date(teaser.reveal_at).getTime()
      : Date.now() + 86400000 * 20;
    const now = Date.now();
    const diff = Math.max(0, targetDate - now);
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    };
  }, [teaser.reveal_at]);

  const [timeLeft, setTimeLeft] = React.useState(() => calculateTime());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 60000);

    return () => clearInterval(interval);
  }, [calculateTime]);

  const { days, hours, minutes } = timeLeft;


  return (
    <div className={cn("flex flex-col items-center sticky top-24", className)}>
      {/* Simulation Header */}
      <div className="w-full max-w-[360px] flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8]">
          <Radio className="w-4 h-4 text-[#A3E635] animate-pulse" />
          <span>Lotus Radar (Mobile Feed)</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30">
          Oficial
        </span>
      </div>

      {/* Smartphone Frame */}
      <div className="w-[360px] bg-black rounded-[44px] p-3 border-[6px] border-[#1F293D] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative overflow-hidden ring-1 ring-white/10">
        {/* Notch */}
        <div className="w-24 h-4 bg-[#1F293D] rounded-full mx-auto mb-2 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-black/80" />
        </div>

        {/* Screen */}
        <div className="bg-[#0B0E14] rounded-[30px] overflow-y-auto max-h-[580px] scrollbar-none border border-white/5 text-left text-white p-4 space-y-4">
          {/* Radar Feed Card */}
          <div className="rounded-2xl bg-[#121824] border border-[#A3E635]/30 overflow-hidden shadow-2xl relative">
            {/* Top Bar: Official Teaser Badge + Promoter Header */}
            <div className="p-3.5 bg-[#161F30]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0B0E14] p-0.5 border border-white/10 overflow-hidden shrink-0">
                  <img
                    src={activeOrg?.logo_url || "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=150"}
                    alt="Logo"
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block leading-tight flex items-center gap-1">
                    {activeOrg?.name || "Sublime Productions"}
                    <ShieldCheck className="w-3.5 h-3.5 text-[#A3E635]" />
                  </span>
                  <span className="text-[10px] text-[#94A3B8]">
                    {teaser.city || "Porto"} • {teaser.approximate_date || "Outubro 2026"}
                  </span>
                </div>
              </div>

              {/* Official Teaser Pill */}
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#A3E635]/20 text-[#A3E635] border border-[#A3E635]/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635] animate-ping" />
                Radar
              </span>
            </div>

            {/* Teaser Artwork Poster */}
            <div className="relative w-full aspect-[4/5] bg-[#0B0E14] overflow-hidden">
              {teaser.image ? (
                <img
                  src={teaser.image}
                  alt={teaser.title || "Teaser Artwork"}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#121824] via-[#1E293B] to-[#0B0E14] flex items-center justify-center p-6 text-center">
                  <span className="text-xs text-[#64748B]">Insere uma imagem teaser misteriosa</span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#121824] via-transparent to-black/40" />

              {/* Category tag */}
              <div className="absolute top-3 left-3">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white">
                  {teaser.category || "Música Eletrónica & Clubbing"}
                </span>
              </div>

              {/* Reveal Countdown Overlay */}
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/75 backdrop-blur-md border border-[#A3E635]/40 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#A3E635]">
                  <Clock className="w-3 h-3 text-[#A3E635]" />
                  <span>Reveal Oficial Em</span>
                </div>
                <div className="flex items-center justify-center gap-2 font-mono font-bold text-white text-sm">
                  <span className="bg-[#121824] px-1.5 py-0.5 rounded border border-white/10">{String(days).padStart(2, '0')}d</span>
                  <span>:</span>
                  <span className="bg-[#121824] px-1.5 py-0.5 rounded border border-white/10">{String(hours).padStart(2, '0')}h</span>
                  <span>:</span>
                  <span className="bg-[#121824] px-1.5 py-0.5 rounded border border-white/10">{String(minutes).padStart(2, '0')}m</span>
                </div>
              </div>
            </div>

            {/* Teaser Content & Hint */}
            <div className="p-4 space-y-3">
              <div>
                <h4 className="text-base font-black text-white uppercase tracking-tight">
                  {teaser.title || teaser.codename || "SOMETHING IS COMING"}
                </h4>
                <p className="text-xs text-[#94A3B8] mt-1 line-clamp-3 leading-relaxed">
                  {teaser.description || "Pista e antecipação exclusiva para os utilizadores Lotus."}
                </p>
              </div>

              {/* Tracking Button (Interactive) */}
              <button
                type="button"
                onClick={() => setIsTracking(!isTracking)}
                className={cn(
                  "w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer",
                  isTracking
                    ? "bg-[#1E293B] text-white border border-[#A3E635]/60 shadow-[0_0_15px_rgba(163,230,53,0.2)]"
                    : "bg-[#A3E635] text-black shadow-[0_0_20px_rgba(163,230,53,0.35)] hover:bg-[#BEF264]"
                )}
              >
                {isTracking ? (
                  <>
                    <Check className="w-4 h-4 text-[#A3E635]" />
                    <span>A Acompanhar Reveal</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    <span>Quero saber quando for revelado</span>
                  </>
                )}
              </button>

              {/* Live Tracking count */}
              <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1">
                <span>🔔 {currentCount.toLocaleString("pt-PT")} utilizadores a acompanhar</span>
                <span className="text-[#A3E635]">Notificação direta</span>
              </div>
            </div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="w-28 h-1 bg-white/20 rounded-full mx-auto mt-2" />
      </div>

      <p className="text-[11px] text-[#64748B] mt-3 text-center">
        Formato de exibição oficial no Lotus Radar
      </p>
    </div>
  );
};
