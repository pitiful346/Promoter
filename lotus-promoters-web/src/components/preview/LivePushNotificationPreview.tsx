"use client";

import * as React from "react";
import { SystemNotificationLog } from "@/core/domain/notification";
import { cn } from "@/lib/utils";

import {
  Bell,
  Sparkles,
  CheckCircle,
} from "lucide-react";

interface LivePushNotificationPreviewProps {
  notification?: Partial<SystemNotificationLog>;
  className?: string;
}

export const LivePushNotificationPreview: React.FC<LivePushNotificationPreviewProps> = ({
  notification = {
    title: "Sublime Productions publicou um novo evento!",
    body: "Sublime Open Air 2026 foi confirmado para 31 de Outubro. Bilhetes já disponíveis.",
    deep_link: {
      scheme: "lotus://",
      target: "event",
      target_id: "event_1",
      url: "lotus://event/event_1",
    },
  },
  className,
}) => {
  const [hasTapped, setHasTapped] = React.useState(false);


  return (
    <div className={cn("flex flex-col items-center sticky top-24", className)}>
      {/* Simulation Header */}
      <div className="w-full max-w-[360px] flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8]">
          <Bell className="w-4 h-4 text-[#A3E635]" />
          <span>Simulador de Push Notification</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30">
          iOS / Android
        </span>
      </div>

      {/* Smartphone Frame */}
      <div className="w-[360px] bg-black rounded-[44px] p-3 border-[6px] border-[#1F293D] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative overflow-hidden ring-1 ring-white/10">
        {/* Notch */}
        <div className="w-24 h-4 bg-[#1F293D] rounded-full mx-auto mb-2 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-black/80" />
        </div>

        {/* Lock Screen / Device Display */}
        <div className="bg-gradient-to-b from-[#0B0E14] via-[#121824] to-[#0B0E14] rounded-[30px] overflow-hidden h-[540px] border border-white/5 text-left text-white p-4 flex flex-col justify-between relative">
          {/* Top Clock on Lock Screen */}
          <div className="text-center pt-8 space-y-1">
            <span className="text-[11px] font-medium text-[#94A3B8] block">
              Sexta-feira, 21 de Agosto
            </span>
            <span className="text-5xl font-black text-white tracking-tight font-mono block">
              21:42
            </span>
          </div>

          {/* Interactive Native Push Banner Card */}
          <div className="space-y-3 relative z-10 -mt-12">
            <div
              onClick={() => setHasTapped(!hasTapped)}
              className={cn(
                "p-3.5 rounded-2xl bg-[#161F30]/95 backdrop-blur-xl border transition-all duration-300 shadow-2xl cursor-pointer select-none",
                hasTapped
                  ? "border-[#A3E635] shadow-[0_0_25px_rgba(163,230,53,0.35)] scale-[1.02]"
                  : "border-white/15 hover:border-white/30"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#A3E635] to-[#4D7C0F] p-[1px] flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-black fill-black" />
                  </div>
                  <span className="text-[11px] font-black tracking-wider text-white">LOTUS</span>
                  <span className="text-[10px] text-[#64748B]">• agora</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#A3E635]/20 text-[#A3E635]">
                  Sistema
                </span>
              </div>

              {/* Title & Body */}
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-white leading-tight">
                  {notification.title || "Notificação de Sistema"}
                </h5>
                <p className="text-[11px] text-[#CBD5E1] leading-relaxed">
                  {notification.body || "Mensagem enviada pelo ecossistema Lotus."}
                </p>
              </div>

              {/* Deep Link Footer */}
              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                <span className="font-mono text-[#A3E635] bg-[#0B0E14] px-2 py-0.5 rounded border border-white/5">
                  {notification.deep_link?.url || "lotus://event/1"}
                </span>
                <span className="text-[#94A3B8] flex items-center gap-0.5 font-medium">
                  {hasTapped ? "✓ Deep Link Aberto" : "Toca para abrir →"}
                </span>
              </div>
            </div>

            {hasTapped && (
              <div className="p-3 rounded-xl bg-black/60 backdrop-blur-md border border-[#A3E635]/40 text-center animate-fade-in space-y-1">
                <div className="text-[10px] font-bold text-[#A3E635] flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Deep Link Executado com Sucesso</span>
                </div>
                <p className="text-[9px] text-[#94A3B8]">
                  O utilizador é encaminhado diretamente para o ecrã do evento na app móvel (em foreground, background ou app fechada).
                </p>
              </div>
            )}
          </div>

          {/* Bottom Lock Screen Icons */}
          <div className="flex items-center justify-between px-6 pb-2 text-[#94A3B8]">
            <div className="w-9 h-9 rounded-full bg-[#161F30]/80 backdrop-blur-md flex items-center justify-center border border-white/10">
              <span className="text-xs">🔦</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#161F30]/80 backdrop-blur-md flex items-center justify-center border border-white/10">
              <span className="text-xs">📷</span>
            </div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="w-28 h-1 bg-white/20 rounded-full mx-auto mt-2" />
      </div>

      <p className="text-[11px] text-[#64748B] mt-3 text-center">
        Toca no banner para simular o comportamento de deep link
      </p>
    </div>
  );
};
