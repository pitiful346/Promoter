"use client";

import * as React from "react";
import { Organization } from "@/core/domain/organization";
import { useEventStore } from "@/stores/useEventStore";
import { formatDateTime, formatCurrency, cn } from "@/lib/utils";
import {
  ShieldCheck,
  MapPin,
  Globe,
  AtSign,
  Users,
  Radio,
} from "lucide-react";



interface PublicPromoterProfilePreviewProps {
  organization: Partial<Organization>;
  className?: string;
}

export const PublicPromoterProfilePreview: React.FC<PublicPromoterProfilePreviewProps> = ({
  organization,
  className,
}) => {
  const [activeTab, setActiveTab] = React.useState<"upcoming" | "teasers" | "past" | "about">("upcoming");
  const { events } = useEventStore();

  // Get events associated with this org
  const orgEvents = events.filter(
    (e) => e.organization_id === organization.id
  );
  const upcomingEvents = orgEvents.filter((e) => e.status === "PUBLISHED");

  const [isFollowing, setIsFollowing] = React.useState(false);
  const baseFollowers = organization.followers_count !== undefined ? organization.followers_count : 0;
  const currentFollowers = baseFollowers + (isFollowing ? 1 : 0);


  const formatFollowers = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k seguidores`;
    return `${count} seguidores`;
  };

  const handleToggleFollow = () => {
    setIsFollowing((prev) => !prev);
  };

  return (
    <div className={cn("flex flex-col items-center sticky top-24", className)}>
      {/* Header controls */}
      <div className="w-full max-w-[360px] flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8]">
          <Users className="w-4 h-4 text-[#A3E635]" />
          <span>Preview Perfil Público (Lotus Mobile)</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30">
          Mobile Feed View
        </span>
      </div>

      {/* Phone Frame */}
      <div className="w-[360px] bg-black rounded-[44px] p-3 border-[6px] border-[#1F293D] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative overflow-hidden ring-1 ring-white/10">
        {/* Notch */}
        <div className="w-24 h-4 bg-[#1F293D] rounded-full mx-auto mb-2 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-black/80" />
        </div>

        {/* Screen */}
        <div className="bg-[#0B0E14] rounded-[30px] overflow-y-auto max-h-[580px] scrollbar-none border border-white/5 text-left text-white">
          {/* Banner Cover */}
          <div className="relative w-full h-32 bg-[#161F30] overflow-hidden">
            {organization.banner_url ? (
              <img
                src={organization.banner_url}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#121824] via-[#1F2B42] to-[#121824]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-black/30" />
          </div>

          {/* Avatar + Main Info */}
          <div className="px-4 -mt-10 relative z-10 space-y-3">
            <div className="flex items-end justify-between">
              {/* Circular Logo */}
              <div className="w-20 h-20 rounded-2xl bg-[#0B0E14] p-1 border-2 border-white/20 shadow-xl overflow-hidden">
                {organization.logo_url ? (
                  <img
                    src={organization.logo_url}
                    alt={organization.name || "Logo"}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1E293B] rounded-xl flex items-center justify-center text-[#A3E635] font-bold text-lg">
                    {organization.name ? organization.name.slice(0, 2).toUpperCase() : "LO"}
                  </div>
                )}
              </div>

              {/* Follow button (Interactive preview for Task 15) */}
              <button
                type="button"
                onClick={handleToggleFollow}
                className={cn(
                  "px-4 py-1.5 rounded-full font-bold text-xs transition-all duration-200 cursor-pointer",
                  isFollowing
                    ? "bg-[#1E293B] text-white border border-white/20 hover:border-white/40"
                    : "bg-[#A3E635] text-black shadow-[0_0_15px_rgba(163,230,53,0.35)] hover:bg-[#BEF264]"
                )}
              >
                {isFollowing ? "✓ A Seguir" : "+ Seguir"}
              </button>
            </div>

            {/* Title & verification */}
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-bold text-white leading-tight">
                  {organization.name || "Nome da Organização"}
                </h3>
                {organization.is_verified && (
                  <ShieldCheck className="w-4 h-4 text-[#A3E635] shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#64748B]" />
                  {organization.city || "Lisboa"}, Portugal
                </span>
                <span>•</span>
                <span className="text-[#A3E635] font-medium">
                  {formatFollowers(currentFollowers)}
                </span>
              </div>
            </div>

            {/* Categories Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(organization.categories && organization.categories.length > 0
                ? organization.categories
                : ["Música & Festivais", "Clubbing"]
              ).map((cat) => (
                <span
                  key={cat}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#161F30] border border-white/10 text-[#CBD5E1]"
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Bio description */}
            <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-3">
              {organization.description ||
                "Apresentação da entidade promotora no ecossistema Lotus para os fãs de eventos."}
            </p>

            {/* Social Links Bar */}
            <div className="flex items-center gap-2 pt-1">
              {organization.instagram && (
                <span className="p-1.5 rounded-lg bg-[#161F30] text-[#CBD5E1] text-[10px] flex items-center gap-1 border border-white/5">
                  <AtSign className="w-3 h-3 text-[#A3E635]" />
                  {organization.instagram}
                </span>
              )}
              {organization.website && (
                <span className="p-1.5 rounded-lg bg-[#161F30] text-[#CBD5E1] text-[10px] flex items-center gap-1 border border-white/5 truncate max-w-[120px]">
                  <Globe className="w-3 h-3 text-[#A3E635]" />
                  Website
                </span>
              )}
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-white/10 pt-3 text-xs font-semibold">
              {[
                { id: "upcoming", label: "Próximos" },
                { id: "teasers", label: "Radar" },
                { id: "past", label: "Passados" },
                { id: "about", label: "Sobre" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "upcoming" | "teasers" | "past" | "about")}
                  className={cn(

                    "pb-2 relative text-center flex-1 transition-colors text-[11px]",
                    activeTab === tab.id
                      ? "text-[#A3E635] font-bold"
                      : "text-[#64748B] hover:text-[#94A3B8]"
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#A3E635] rounded-full shadow-[0_0_8px_#A3E635]" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="py-2 space-y-2.5 pb-6">
              {activeTab === "upcoming" && (
                <div className="space-y-2.5">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="p-2.5 rounded-xl bg-[#121824] border border-white/10 flex items-center gap-3"
                    >
                      <img
                        src={event.image}
                        alt={event.name}
                        className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                      <div className="overflow-hidden flex-1">
                        <span className="text-[10px] font-bold text-[#A3E635] block">
                          {formatDateTime(event.start_date)}
                        </span>
                        <h5 className="text-xs font-bold text-white truncate">
                          {event.name}
                        </h5>
                        <span className="text-[10px] text-[#94A3B8] block truncate">
                          {event.venue_name || event.location}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-white shrink-0">
                        {formatCurrency(event.price_min, event.is_free)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "teasers" && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#161F30] to-[#121824] border border-[#A3E635]/30 text-center space-y-2">
                  <Radio className="w-5 h-5 text-[#A3E635] mx-auto animate-pulse" />
                  <span className="text-xs font-bold text-white block">Lotus Radar Ativo</span>
                  <p className="text-[10px] text-[#94A3B8]">
                    Novos teasers e reveals exclusivos desta organização surgirão aqui.
                  </p>
                </div>
              )}

              {activeTab === "past" && (
                <div className="p-4 text-center text-xs text-[#64748B]">
                  Histórico de eventos anteriores organizados.
                </div>
              )}

              {activeTab === "about" && (
                <div className="p-3 rounded-xl bg-[#121824] border border-white/5 space-y-2 text-xs text-[#94A3B8]">
                  <span className="text-[10px] font-bold text-[#A3E635] uppercase">Sobre a Entidade</span>
                  <p className="text-[11px] leading-relaxed text-[#CBD5E1]">
                    {organization.description || "Sem informação detalhada."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="w-28 h-1 bg-white/20 rounded-full mx-auto mt-2" />
      </div>

      <p className="text-[11px] text-[#64748B] mt-3 text-center">
        Atualização dinâmica em tempo real
      </p>
    </div>
  );
};
