import * as React from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { MapPin, Calendar, Ticket, Heart, Share2, Sparkles } from "lucide-react";
import { LotusEvent } from "@/core/domain/event";

interface MobileEventPreviewProps {
  event: Partial<LotusEvent>;
  organizerName?: string;
  viewMode?: "card" | "detail";
}

export const MobileEventCard: React.FC<MobileEventPreviewProps> = ({
  event,
  organizerName = "Sublime Productions",
  viewMode = "card",
}) => {
  const isDetail = viewMode === "detail";

  return (
    <div className="w-full bg-[#0F141F] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col text-left">
      {/* Event Banner */}
      <div className="relative w-full aspect-[16/10] bg-[#161F30] overflow-hidden group">
        {event.image ? (
          <img
            src={event.image}
            alt={event.name || "Imagem do evento"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#64748B] p-4 text-center">
            <Sparkles className="w-8 h-8 text-[#A3E635]/40 mb-2" />
            <span className="text-xs">Pré-visualização da Imagem</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F141F] via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[#A3E635] border border-[#A3E635]/30">
            {event.categoria?.[0] || "Geral"}
          </span>

          <div className="flex items-center gap-1.5">
            <button className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-white">
              <Heart className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-white">
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Price Tag Pill */}
        <div className="absolute bottom-3 right-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#A3E635] text-black shadow-lg">
            {formatCurrency(event.price_min || 0, event.is_free)}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#A3E635] font-medium mb-1">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{formatDateTime(event.start_date)}</span>
          </div>

          <h4 className="text-base font-bold text-white leading-snug line-clamp-2">
            {event.name || "Título do Teu Evento Lotus"}
          </h4>
        </div>

        {/* Venue / Location */}
        <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
          <MapPin className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
          <span className="truncate">
            {event.venue_name ? `${event.venue_name}, ` : ""}
            {event.location || "Localidade"}
          </span>
        </div>

        {/* Organizer info */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
          <span className="text-[11px] text-[#64748B]">Organizado por</span>
          <span className="text-[11px] font-medium text-white truncate max-w-[150px]">
            {organizerName}
          </span>
        </div>

        {isDetail && (
          <div className="pt-3 space-y-3 border-t border-white/[0.06]">
            <div>
              <h5 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                Sobre o Evento
              </h5>
              <p className="text-xs text-[#CBD5E1] leading-relaxed line-clamp-4">
                {event.description || "A descrição completa do teu evento aparecerá aqui no detalhe da aplicação Lotus."}
              </p>
            </div>

            {/* Mobile Ticket Button CTA */}
            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#A3E635] to-[#84CC16] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(163,230,53,0.3)]">
              <Ticket className="w-4 h-4" />
              <span>Ver Bilhetes / Comprar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
