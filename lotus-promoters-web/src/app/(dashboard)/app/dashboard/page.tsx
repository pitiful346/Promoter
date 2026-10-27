"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useOrgStore } from "@/stores/useOrgStore";
import { useEventStore } from "@/stores/useEventStore";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  CalendarDays,
  MousePointerClick,
  FileEdit,
  MapPin,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Smartphone,
  Eye,
  Users,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { LiveMobilePreview } from "@/components/preview/LiveMobilePreview";
import { LotusEvent } from "@/core/domain/event";

export default function DashboardPage() {
  const { getActiveOrg } = useOrgStore();
  const activeOrg = getActiveOrg();
  const { events, loadEvents, isLoadingEvents } = useEventStore();
  const [selectedPreviewEvent, setSelectedPreviewEvent] = React.useState<LotusEvent | null>(null);

  React.useEffect(() => {
    if (activeOrg?.id) {
      loadEvents(activeOrg.id);
    }
  }, [activeOrg?.id, loadEvents]);

  const orgEvents = events.filter((e) => e.organization_id === activeOrg?.id);
  const publishedEvents = orgEvents.filter((e) => e.status === "PUBLISHED");
  const draftEvents = orgEvents.filter((e) => e.status === "DRAFT" || e.status === "SUBMITTED");
  const totalClicks = orgEvents.reduce((acc, curr) => acc + (curr.click_count || 0), 0);



  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Actions */}
      <PageHeader
        title={`Visão Geral — ${activeOrg?.name || "Organização"}`}
        subtitle="Acompanha o desempenho e estado dos teus eventos publicados no Lotus."
        actions={
          <div className="flex items-center gap-3">
            <Link href="/app/venues/new">
              <Button variant="secondary" size="sm">
                <MapPin className="w-4 h-4" />
                <span>Novo Local</span>
              </Button>
            </Link>
            <Link href="/app/events/new">
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4" />
                <span>Criar Evento</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Publicados */}
        <Card isGlass className="relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              Eventos Ativos
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {publishedEvents.length}
            </span>
            <span className="text-xs font-medium text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              Na App Lotus
            </span>
          </div>
          <div className="mt-2 text-xs text-[#64748B]">
            Visíveis em tempo real para o público
          </div>
        </Card>

        {/* Metric 2: Cliques Totais */}
        <Card isGlass className="relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              Cliques em Bilhetes
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#A3E635]/15 border border-[#A3E635]/30 flex items-center justify-center text-[#A3E635] shadow-[0_0_12px_rgba(163,230,53,0.3)]">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {totalClicks.toLocaleString("pt-PT")}
            </span>
            <span className="text-xs font-medium text-[#A3E635] flex items-center">
              +18.4% este mês
            </span>
          </div>
          <div className="mt-2 text-xs text-[#64748B]">
            Redirecionamentos para bilheteiras
          </div>
        </Card>

        {/* Metric 3: Rascunhos */}
        <Card isGlass className="relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              Rascunhos & Moderação
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileEdit className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {draftEvents.length}
            </span>
            <span className="text-xs text-[#94A3B8]">em preparação</span>
          </div>
          <div className="mt-2 text-xs text-[#64748B]">
            Eventos a aguardar publicação
          </div>
        </Card>

        {/* Metric 4: Seguidores Lotus (TASK 15) */}
        <Card isGlass className="relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              Seguidores Lotus
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#A3E635]/15 border border-[#A3E635]/30 flex items-center justify-center text-[#A3E635]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {(activeOrg?.followers_count ?? 0).toLocaleString("pt-PT")}
            </span>
            <span className="text-xs font-medium text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              Na App Lotus
            </span>
          </div>
          <div className="mt-2 text-xs text-[#64748B]">
            Utilizadores a seguir a organização
          </div>
        </Card>
      </div>


      {/* Sync Ecosystem Alert Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#121824] via-[#161F30] to-[#121824] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A3E635]/15 border border-[#A3E635]/30 flex items-center justify-center text-[#A3E635] shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              Sincronização Lotus Central Ativa
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h4>
            <p className="text-xs text-[#94A3B8]">
              Qualquer alteração efetuada aqui reflete-se instantaneamente na aplicação móvel Lotus dos utilizadores.
            </p>
          </div>
        </div>

        <Link href="/app/events/new">
          <Button size="sm" variant="secondary" className="shrink-0 text-xs">
            <span>Criar Novo Evento</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Recent Events Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Eventos Recentes</h2>
            <p className="text-xs text-[#94A3B8]">
              Lista dos eventos da tua organização organizados por data de criação.
            </p>
          </div>
          <Link href="/app/events">
            <Button variant="ghost" size="sm" className="text-xs">
              <span>Ver Todos os Eventos</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {orgEvents.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#121824]/40 border border-white/10 text-center space-y-4">
            <CalendarDays className="w-10 h-10 text-[#64748B] mx-auto" />
            <h3 className="text-base font-semibold text-white">Nenhum evento criado</h3>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
              Ainda não publicaste nenhum evento para esta organização. Cria o teu primeiro evento para começar a receber cliques e seguidores.
            </p>
            <Link href="/app/events/new">
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                <span>Criar Primeiro Evento</span>
              </Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Local & Data</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Cliques</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgEvents.map((event) => (
                <TableRow key={event.id}>
                  {/* Event Title & Image */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={event.image}
                        alt={event.name}
                        className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                      <div>
                        <span className="font-semibold text-white block text-sm">
                          {event.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-[#A3E635] font-medium">
                            {event.categoria[0]}
                          </span>
                          {event.is_boosted && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
                              BOOSTED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Location & Date */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="text-xs font-medium text-white flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{formatDateTime(event.start_date)}</span>
                      </div>
                      <div className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{event.venue_name || event.location}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <StatusBadge status={event.status} />
                  </TableCell>

                  {/* Price */}
                  <TableCell>
                    <span className="text-xs font-medium text-white">
                      {formatCurrency(event.price_min, event.is_free)}
                    </span>
                  </TableCell>

                  {/* Click count */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                      <MousePointerClick className="w-3.5 h-3.5 text-[#A3E635]" />
                      <span>{(event.click_count || 0).toLocaleString("pt-PT")}</span>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedPreviewEvent(event)}
                        className="p-2 rounded-lg text-[#94A3B8] hover:text-[#A3E635] hover:bg-white/5 transition-colors"
                        title="Pré-visualizar na App Mobile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link href={`/app/events`}>
                        <Button variant="secondary" size="sm" className="text-xs py-1 px-2.5">
                          Gerir
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>


      {/* Live Preview Modal */}
      {selectedPreviewEvent && (
        <Modal
          isOpen={!!selectedPreviewEvent}
          onClose={() => setSelectedPreviewEvent(null)}
          title={`Simulação Mobile — ${selectedPreviewEvent.name}`}
          description="Visualização exata de como este evento é renderizado na aplicação móvel Lotus para os utilizadores."
          maxWidth="md"
        >
          <div className="py-2 flex justify-center">
            <LiveMobilePreview
              event={selectedPreviewEvent}
              organizerName={activeOrg?.name}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
