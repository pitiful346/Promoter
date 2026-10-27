"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LiveMobilePreview } from "@/components/preview/LiveMobilePreview";
import { useOrgStore } from "@/stores/useOrgStore";
import { useEventStore } from "@/stores/useEventStore";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Ticket,
  MousePointerClick,
  Eye,
  TrendingUp,
  Share2,
  Bookmark,
  CheckCircle,
  XCircle,
  Edit,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { getActiveOrg } = useOrgStore();
  const activeOrg = getActiveOrg();
  const { getEventById, updateEvent } = useEventStore();

  const event = getEventById(eventId) || {
    id: eventId,
    organization_id: activeOrg?.id || "",
    name: "Evento",
    description: "",
    location: "Lisboa",
    venue_name: "",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
    extra_images: [],
    start_date: new Date().toISOString(),
    price_min: 0,
    is_free: false,
    ticket_status: "AVAILABLE" as const,
    ticket_url: "",
    categoria: ["Música & Festivais"],
    click_count: 0,

    is_boosted: false,
    is_archived: false,
    status: "DRAFT" as const,
    created_by: "system",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const handleStatusChange = async (newStatus: "PUBLISHED" | "CANCELLED" | "DRAFT") => {
    await updateEvent(eventId, { status: newStatus });
    setToastMessage(`Estado do evento atualizado para ${newStatus}`);
    setTimeout(() => setToastMessage(null), 3000);
  };


  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161F30] border border-[#A3E635]/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up">
          <CheckCircle className="w-5 h-5 text-[#A3E635]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Back button */}
      <div>
        <Link
          href="/app/events"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#94A3B8] hover:text-[#A3E635] mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar à Lista de Eventos</span>
        </Link>

        <PageHeader
          title={event.name}
          subtitle={`Organizado por ${activeOrg?.name} • Criado a ${formatDateTime(event.created_at)}`}
          badge={<StatusBadge status={event.status} />}
          actions={
            <div className="flex items-center gap-2.5">
              {event.ticket_url && (
                <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Testar Bilheteira</span>
                  </Button>
                </a>
              )}

              {event.status !== "PUBLISHED" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStatusChange("PUBLISHED")}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Publicar no Lotus</span>
                </Button>
              )}

              {event.status === "PUBLISHED" && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleStatusChange("CANCELLED")}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancelar Evento</span>
                </Button>
              )}
            </div>
          }
        />
      </div>

      {/* Grid: 7 Cols Details & Analytics / 5 Cols Live Mobile Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Event Metrics & Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Performance KPIs for this event */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card isGlass>
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Cliques em Bilhetes</span>
                <MousePointerClick className="w-4 h-4 text-[#A3E635]" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white">
                {event.click_count.toLocaleString("pt-PT")}
              </div>
              <span className="text-[11px] text-[#A3E635] font-medium flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-0.5" /> Redirecionamentos
              </span>
            </Card>

            <Card isGlass>
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Visualizações</span>
                <Eye className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white">
                {(event.click_count * 12 + 150).toLocaleString("pt-PT")}
              </div>
              <span className="text-[11px] text-cyan-400 font-medium mt-1 block">
                Impressões na app
              </span>
            </Card>

            <Card isGlass>
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Guardados / Fãs</span>
                <Bookmark className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white">
                {(event.click_count * 2 + 30).toLocaleString("pt-PT")}
              </div>
              <span className="text-[11px] text-purple-400 font-medium mt-1 block">
                Em favoritos
              </span>
            </Card>
          </div>

          {/* Event Content Breakdown Card */}
          <Card isGlass className="space-y-5">
            <h3 className="text-base font-bold text-white">Informações Registadas</h3>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#121824] border border-white/5">
                <div className="space-y-1">
                  <span className="text-[#64748B] uppercase tracking-wider text-[10px] font-bold">
                    Data & Hora
                  </span>
                  <div className="text-white font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#A3E635]" />
                    {formatDateTime(event.start_date)}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[#64748B] uppercase tracking-wider text-[10px] font-bold">
                    Localização & Recinto
                  </span>
                  <div className="text-white font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#64748B]" />
                    {event.venue_name || event.location}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[#64748B] uppercase tracking-wider text-[10px] font-bold">
                    Preço de Entrada
                  </span>
                  <div className="text-white font-medium">
                    {formatCurrency(event.price_min, event.is_free)}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[#64748B] uppercase tracking-wider text-[10px] font-bold">
                    Categorias
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {event.categoria.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded bg-[#1E293B] text-[#A3E635] text-[10px] font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[#64748B] uppercase tracking-wider text-[10px] font-bold block mb-1.5">
                  Descrição do Evento
                </span>
                <p className="text-[#CBD5E1] text-xs leading-relaxed p-4 rounded-xl bg-[#121824] border border-white/5">
                  {event.description}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Mobile View Simulator */}
        <div className="lg:col-span-5 hidden lg:block">
          <LiveMobilePreview
            event={event}
            organizerName={activeOrg?.name}
          />
        </div>
      </div>
    </div>
  );
}
