"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { LiveRevealCountdownPreview } from "@/components/preview/LiveRevealCountdownPreview";
import { useOrgStore } from "@/stores/useOrgStore";
import { useTeaserStore } from "@/stores/useTeaserStore";
import { useEventStore } from "@/stores/useEventStore";
import { LotusEvent } from "@/core/domain/event";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import {
  Radio,
  ArrowLeft,
  Clock,
  Sparkles,
  Zap,
  Bell,
  CheckCircle,
  AlertCircle,
  Lock,
  ExternalLink,
  ShieldCheck,
  Calendar,
  MapPin,
  Ticket,
} from "lucide-react";

export default function TeaserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teaserId = params.id as string;

  const { getActiveOrg } = useOrgStore();
  const activeOrg = getActiveOrg();
  const { getTeaserById, revealTeaser, cancelTeaser } = useTeaserStore();
  const { events } = useEventStore();

  const teaser = getTeaserById(teaserId) || {
    id: teaserId,
    organization_id: activeOrg?.id || "",
    codename: "TEASER",
    title: "",
    description: "",
    image: "",
    city: "Lisboa",
    category: "Música Eletrónica & Clubbing",
    reveal_at: new Date().toISOString(),
    status: "DRAFT" as const,
    tracking_count: 0,
    is_official: true,
    created_by: "system",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const orgEvents = events.filter((e) => e.organization_id === activeOrg?.id);
  const [selectedEventId, setSelectedEventId] = React.useState<string>(
    teaser.linked_event_id || orgEvents[0]?.id || ""
  );
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [isRevealing, setIsRevealing] = React.useState(false);

  const selectedEvent = orgEvents.find((e) => e.id === selectedEventId) || orgEvents[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleManualReveal = async () => {
    if (!selectedEventId) return;
    setIsRevealing(true);
    try {
      await revealTeaser(teaser.id, selectedEventId);
      showToast("✨ Evento revelado com sucesso no Lotus Radar! O evento oficial está agora público.");
    } finally {
      setIsRevealing(false);
    }
  };

  const isRevealed = teaser.status === "REVEALED";


  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161F30] border border-[#A3E635]/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up">
          <CheckCircle className="w-5 h-5 text-[#A3E635]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Back button */}
      <div>
        <Link
          href="/app/radar"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#A3E635] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Lotus Radar</span>
        </Link>
      </div>

      {/* Page Header */}
      <PageHeader
        title={`Lotus Radar — ${teaser.codename}`}
        subtitle="Gere a contagem decrescente, configura o evento final protegido e executa a revelação oficial."
        actions={
          <div className="flex items-center gap-3">
            {!isRevealed ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleManualReveal}
                isLoading={isRevealing}
              >
                <Zap className="w-4 h-4 mr-1" />
                <span>Executar Reveal Manual</span>
              </Button>
            ) : (
              <Link href={`/app/events/${selectedEventId}`}>
                <Button variant="secondary" size="md">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  <span>Ver Evento Revelado</span>
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Management & Secret Event Binding (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Countdown Status Card */}
          <Card isGlass className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#A3E635]" />
                <span>Estado da Contagem Decrescente</span>
              </h3>
              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                  isRevealed
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    : "bg-[#A3E635]/20 text-[#A3E635] border-[#A3E635]/30"
                }`}
              >
                {isRevealed ? "✨ Revelado" : "🟢 Em Contagem"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#121824] border border-white/5 space-y-1">
                <span className="text-xs text-[#94A3B8] block">Data/Hora Oficial do Reveal</span>
                <span className="text-sm font-bold text-white block font-mono">
                  {formatDateTime(teaser.reveal_at)}
                </span>
                <span className="text-[10px] text-[#64748B]">Timestamp autoritativo</span>
              </div>

              <div className="p-4 rounded-xl bg-[#121824] border border-white/5 space-y-1">
                <span className="text-xs text-[#94A3B8] block">Utilizadores a Acompanhar</span>
                <span className="text-xl font-bold text-[#A3E635] block flex items-center gap-1.5">
                  <Bell className="w-4 h-4" />
                  {teaser.tracking_count.toLocaleString("pt-PT")} inscritos
                </span>
                <span className="text-[10px] text-[#64748B]">Notificação push agendada</span>
              </div>
            </div>
          </Card>

          {/* Section 2: Secret Event Binding (Zero-Leak Security) */}
          <Card isGlass className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#A3E635]" />
                <span>Evento Secreto Vinculado</span>
              </h3>
              <span className="text-[11px] text-[#A3E635] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Segurança Zero-Leak Ativa</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/10 space-y-2">
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                <strong className="text-white">Proteção de Segredos:</strong> Os detalhes reais (local exato, preço, line-up e bilheteira) permanecem estritamente confidenciais e inacessíveis ao público na API até ao momento exato do reveal.
              </p>
            </div>

            {/* Event Selector */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-white block">
                Selecionar Evento Preparado da Organização:
              </label>
              <Select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                options={orgEvents.map((e) => ({
                  value: e.id,
                  label: `${e.name} (${e.venue_name || e.location} · ${formatDateTime(e.start_date)})`,
                }))}
              />
            </div>

            {/* Selected Event Preview Card */}
            {selectedEvent && (
              <div className="p-4 rounded-xl bg-[#121824] border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.name}
                    className="w-14 h-14 rounded-lg object-cover border border-white/10 shrink-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {selectedEvent.name}
                    </span>
                    <span className="text-[11px] text-[#94A3B8] block">
                      {selectedEvent.venue_name || selectedEvent.location}
                    </span>
                    <span className="text-[11px] font-bold text-[#A3E635]">
                      {formatCurrency(selectedEvent.price_min, selectedEvent.is_free)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#94A3B8] pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#A3E635]" />
                    <span>{formatDateTime(selectedEvent.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-[#A3E635]" />
                    <span>Bilhetes: {selectedEvent.ticket_status}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Section 3: Post-Reveal Instructions */}
          <Card isGlass className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A3E635]" />
              <span>Transição Automática & Idempotência</span>
            </h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Quando a contagem decrescente atinge 0, o backend executa a transição de forma idempotente: o teaser é marcado como <code className="text-[#A3E635]">REVEALED</code>, o evento secreto transita para <code className="text-[#A3E635]">PUBLISHED</code> e os utilizadores inscritos tornam-se elegíveis para a notificação de revelação.
            </p>
          </Card>
        </div>

        {/* Right Column: Live Reveal & Countdown Simulator (5 cols) */}
        <div className="lg:col-span-5 hidden lg:block">
          <LiveRevealCountdownPreview
            teaser={teaser}
            linkedEvent={selectedEvent}
            onRevealTrigger={handleManualReveal}
          />
        </div>
      </div>
    </div>
  );
}
