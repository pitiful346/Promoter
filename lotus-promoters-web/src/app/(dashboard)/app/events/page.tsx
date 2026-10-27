"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { LiveMobilePreview } from "@/components/preview/LiveMobilePreview";
import { useOrgStore } from "@/stores/useOrgStore";
import { useEventStore } from "@/stores/useEventStore";
import { LotusEvent, EventStatus } from "@/core/domain/event";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  CalendarDays,
  MapPin,
  MousePointerClick,
  Filter,
} from "lucide-react";

export default function EventsPage() {
  const { getActiveOrg } = useOrgStore();
  const activeOrg = getActiveOrg();
  const { events, isLoadingEvents, loadEvents, publishEvent, cancelEvent, deleteEvent } = useEventStore();
  
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("ALL");
  const [previewEvent, setPreviewEvent] = React.useState<LotusEvent | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = React.useState<string | null>(null);

  // Load events from Firestore when active org changes
  React.useEffect(() => {
    if (activeOrg?.id) {
      loadEvents(activeOrg.id);
    }
  }, [activeOrg?.id, loadEvents]);

  const orgEvents = events.filter((e) => e.organization_id === activeOrg?.id);

  // Counts for tabs
  const tabCounts = {
    ALL: orgEvents.length,
    PUBLISHED: orgEvents.filter((e) => e.status === "PUBLISHED").length,
    DRAFT: orgEvents.filter((e) => e.status === "DRAFT").length,
    SUBMITTED: orgEvents.filter((e) => e.status === "SUBMITTED").length,
    CANCELLED: orgEvents.filter((e) => e.status === "CANCELLED").length,
  };

  const tabs = [
    { id: "ALL", label: "Todos", count: tabCounts.ALL },
    { id: "PUBLISHED", label: "Publicados", count: tabCounts.PUBLISHED },
    { id: "DRAFT", label: "Rascunhos", count: tabCounts.DRAFT },
    { id: "SUBMITTED", label: "Em Revisão", count: tabCounts.SUBMITTED },
    { id: "CANCELLED", label: "Cancelados", count: tabCounts.CANCELLED },
  ];

  // Filtering
  const filteredEvents = orgEvents.filter((event) => {
    const matchesTab = activeTab === "ALL" || event.status === activeTab;
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.categoria.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const handlePublish = async (id: string) => {
    await publishEvent(id);
    showToast("Evento publicado com sucesso na app Lotus!");
  };

  const handleCancel = async (id: string) => {
    await cancelEvent(id);
    showToast("Evento cancelado e atualizado na app.");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tens a certeza que pretendes apagar este evento?")) {
      await deleteEvent(id);
      showToast("Evento removido com sucesso.");
    }
  };

  const showToast = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {actionSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161F30] border border-[#A3E635]/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up">
          <CheckCircle className="w-5 h-5 text-[#A3E635]" />
          <span className="text-sm font-medium">{actionSuccessMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Gestão de Eventos"
        subtitle="Gere todo o ciclo de vida dos teus eventos: rascunhos, submissões, publicações e cancelamentos."
        actions={
          <Link href="/app/events/new">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4" />
              <span>Criar Novo Evento</span>
            </Button>
          </Link>
        }
      />

      {/* Control Bar: Tabs + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por nome, cidade ou recinto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121824] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]/40 transition-colors"
          />
        </div>
      </div>

      {/* Events Table */}
      {filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#121824]/40 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1E293B] flex items-center justify-center mx-auto text-[#64748B]">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Nenhum evento encontrado</h3>
            <p className="text-xs text-[#94A3B8] mt-1">
              Não existem eventos para os filtros selecionados ou pesquisa atual.
            </p>
          </div>
          <Link href="/app/events/new">
            <Button variant="secondary" size="sm">
              Criar o Primeiro Evento
            </Button>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Evento</TableHead>
              <TableHead>Data & Recinto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Bilhete / Preço</TableHead>
              <TableHead>Cliques</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.map((event) => (
              <TableRow key={event.id}>
                {/* Event Name & Poster */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={event.image}
                      alt={event.name}
                      className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div>
                      <span className="font-semibold text-white block text-sm">
                        {event.name}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-medium text-[#A3E635]">
                          {event.categoria[0]}
                        </span>
                        {event.categoria[1] && (
                          <span className="text-[11px] text-[#94A3B8]">
                            • {event.categoria[1]}
                          </span>
                        )}
                        {event.is_boosted && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                            BOOST
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Date & Venue */}
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-white flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-[#A3E635]" />
                      <span>{formatDateTime(event.start_date)}</span>
                    </div>
                    <div className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>{event.venue_name || event.location}</span>
                    </div>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <StatusBadge status={event.status} />
                </TableCell>

                {/* Price & Ticket URL */}
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-white">
                      {formatCurrency(event.price_min, event.is_free)}
                    </div>
                    <span className="text-[11px] text-[#64748B] block truncate max-w-[140px]">
                      {event.ticket_url ? "Link configurado" : "Sem bilheteira"}
                    </span>
                  </div>
                </TableCell>

                {/* Analytics / Click count */}
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <MousePointerClick className="w-3.5 h-3.5 text-[#A3E635]" />
                    <span>{event.click_count.toLocaleString("pt-PT")}</span>
                  </div>
                </TableCell>

                {/* Action Buttons */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Live Mobile Preview button */}
                    <button
                      onClick={() => setPreviewEvent(event)}
                      className="p-2 rounded-lg text-[#94A3B8] hover:text-[#A3E635] hover:bg-white/5 transition-colors"
                      title="Pré-visualizar na App Mobile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Publish Action (if draft or submitted) */}
                    {event.status !== "PUBLISHED" && (
                      <button
                        onClick={() => handlePublish(event.id)}
                        className="p-2 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                        title="Publicar Agora"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}

                    {/* Cancel Action (if published) */}
                    {event.status === "PUBLISHED" && (
                      <button
                        onClick={() => handleCancel(event.id)}
                        className="p-2 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                        title="Cancelar Evento"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete action */}
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 rounded-lg text-[#64748B] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Apagar Evento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Live Preview Modal */}
      {previewEvent && (
        <Modal
          isOpen={!!previewEvent}
          onClose={() => setPreviewEvent(null)}
          title={`Simulação Mobile — ${previewEvent.name}`}
          description="Visualização em tempo real da renderização na aplicação Lotus para telemóvel."
          maxWidth="md"
        >
          <div className="py-2 flex justify-center">
            <LiveMobilePreview
              event={previewEvent}
              organizerName={activeOrg?.name}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
