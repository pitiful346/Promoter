"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { LiveRadarTeaserPreview } from "@/components/preview/LiveRadarTeaserPreview";
import { useOrgStore } from "@/stores/useOrgStore";
import { useTeaserStore } from "@/stores/useTeaserStore";
import { LotusTeaser, TeaserStatus } from "@/core/domain/teaser";
import { formatDateTime } from "@/lib/utils";
import {
  Radio,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Bell,
  Sparkles,
  Link2,
  TrendingUp,
} from "lucide-react";

export default function RadarDashboardPage() {
  const { getActiveOrg } = useOrgStore();
  const activeOrg = getActiveOrg();
  const { teasers, loadTeasers, deleteTeaser, publishTeaser, cancelTeaser, isLoadingTeasers } = useTeaserStore();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("ALL");
  const [previewTeaser, setPreviewTeaser] = React.useState<LotusTeaser | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (activeOrg?.id) {
      loadTeasers(activeOrg.id);
    }
  }, [activeOrg?.id, loadTeasers]);

  const orgTeasers = teasers.filter((t) => t.organization_id === activeOrg?.id);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Tab counts
  const tabCounts = {
    ALL: orgTeasers.length,
    PUBLISHED: orgTeasers.filter((t) => t.status === "PUBLISHED").length,
    SCHEDULED: orgTeasers.filter((t) => t.status === "SCHEDULED").length,
    REVEALED: orgTeasers.filter((t) => t.status === "REVEALED").length,
    DRAFT: orgTeasers.filter((t) => t.status === "DRAFT").length,
  };

  const tabs = [
    { id: "ALL", label: "Todos", count: tabCounts.ALL },
    { id: "PUBLISHED", label: "No Radar", count: tabCounts.PUBLISHED },
    { id: "SCHEDULED", label: "Agendados", count: tabCounts.SCHEDULED },
    { id: "REVEALED", label: "Revelados", count: tabCounts.REVEALED },
    { id: "DRAFT", label: "Rascunhos", count: tabCounts.DRAFT },
  ];

  const filteredTeasers = orgTeasers.filter((teaser) => {
    const matchesTab = activeTab === "ALL" || teaser.status === activeTab;
    const matchesSearch =
      teaser.codename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teaser.title && teaser.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      teaser.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalTracking = orgTeasers.reduce((acc, curr) => acc + (curr.tracking_count || 0), 0);

  // Next reveal calculation
  const upcomingTeasers = orgTeasers
    .filter((t) => (t.status === "PUBLISHED" || t.status === "SCHEDULED") && t.reveal_at)
    .sort((a, b) => new Date(a.reveal_at).getTime() - new Date(b.reveal_at).getTime());
  const nextReveal = upcomingTeasers[0];

  const [nextRevealDays, setNextRevealDays] = React.useState<number | null>(() => {
    if (!nextReveal?.reveal_at) return null;
    const diff = new Date(nextReveal.reveal_at).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  });

  React.useEffect(() => {
    if (!nextReveal?.reveal_at) return;
    const timer = setInterval(() => {
      const diff = new Date(nextReveal.reveal_at).getTime() - new Date().getTime();
      setNextRevealDays(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
    }, 60000);
    return () => clearInterval(timer);
  }, [nextReveal?.reveal_at]);



  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161F30] border border-[#A3E635]/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up">
          <CheckCircle className="w-5 h-5 text-[#A3E635]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Lotus Radar & Teasers Oficiais"
        subtitle="Cria antecipação oficial para eventos futuros com contagens decrescentes e notificações para quem quer ser o primeiro a saber."
        actions={
          <Link href="/app/radar/new">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4 mr-1" />
              <span>Criar Novo Teaser</span>
            </Button>
          </Link>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card isGlass>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase">Teasers no Radar</span>
            <Radio className="w-4 h-4 text-[#A3E635] animate-pulse" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{tabCounts.PUBLISHED}</span>
            <span className="text-xs text-[#A3E635] font-semibold">Ativos na App</span>
          </div>
          <p className="text-xs text-[#64748B] mt-2">Visíveis no separador Radar do Lotus</p>
        </Card>

        <Card isGlass>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase">Utilizadores a Acompanhar</span>
            <Bell className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{totalTracking.toLocaleString("pt-PT")}</span>
            <span className="text-xs text-cyan-400 font-semibold flex items-center">
              Na App Lotus
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-2">Inscritos para receber notificação no reveal</p>
        </Card>

        <Card isGlass>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase">Próximo Reveal</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {nextReveal ? formatDateTime(nextReveal.reveal_at) : "—"}
            </span>
            {nextRevealDays !== null && (
              <span className="text-xs text-amber-400 font-semibold">
                em {nextRevealDays} dias
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] mt-2">
            {nextReveal ? nextReveal.codename : "Nenhum reveal agendado"}
          </p>
        </Card>

        <Card isGlass>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase">Total Revelados</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{tabCounts.REVEALED}</span>
            <span className="text-xs text-[#94A3B8]">convertidos em eventos</span>
          </div>
          <p className="text-xs text-[#64748B] mt-2">Transição concluída para bilheteira</p>
        </Card>
      </div>


      {/* Main Table Card */}
      <Card isGlass className="space-y-6">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Pesquisar teaser ou cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121824] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#A3E635]"
            />
          </div>
        </div>

        {/* Teasers Table */}
        {filteredTeasers.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <Radio className="w-10 h-10 text-[#64748B] mx-auto animate-pulse" />
            <h4 className="text-base font-bold text-white">Nenhum teaser encontrado</h4>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
              Cria o teu primeiro teaser oficial para começar a gerar entusiasmo em torno dos próximos eventos.
            </p>
            <Link href="/app/radar/new">
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                <span>Criar Primeiro Teaser</span>
              </Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teaser / Codename</TableHead>
                <TableHead>Local & Data Prevista</TableHead>
                <TableHead>Data do Reveal Oficial</TableHead>
                <TableHead className="text-center">A Acompanhar</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeasers.map((teaser) => (
                <TableRow key={teaser.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={teaser.image}
                        alt={teaser.codename}
                        className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-white block text-sm">
                          {teaser.title || teaser.codename}
                        </span>
                        <span className="text-[11px] font-mono text-[#A3E635]">
                          {teaser.codename}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-[#CBD5E1]">
                    <div>{teaser.city}</div>
                    <div className="text-[11px] text-[#64748B]">{teaser.approximate_date || "Data a revelar"}</div>
                  </TableCell>

                  <TableCell className="text-xs text-[#CBD5E1]">
                    <div className="flex items-center gap-1.5 text-white font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{formatDateTime(teaser.reveal_at)}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-center font-bold text-[#A3E635]">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#161F30] border border-white/10 text-xs">
                      <Bell className="w-3 h-3 text-[#A3E635]" />
                      <span>{teaser.tracking_count.toLocaleString("pt-PT")}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        teaser.status === "PUBLISHED"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : teaser.status === "SCHEDULED"
                          ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                          : teaser.status === "REVEALED"
                          ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                          : teaser.status === "CANCELLED"
                          ? "bg-red-500/15 text-red-400 border border-red-500/30"
                          : "bg-gray-500/15 text-gray-400 border border-gray-500/30"
                      }`}
                    >
                      {teaser.status === "PUBLISHED"
                        ? "No Radar"
                        : teaser.status === "SCHEDULED"
                        ? "Agendado"
                        : teaser.status === "REVEALED"
                        ? "Revelado"
                        : teaser.status === "CANCELLED"
                        ? "Cancelado"
                        : "Rascunho"}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewTeaser(teaser)}
                        title="Pré-visualizar no Radar"
                      >
                        <Eye className="w-4 h-4 text-[#A3E635]" />
                      </Button>

                      {teaser.status === "DRAFT" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            await publishTeaser(teaser.id);
                            showToast("Teaser publicado no Lotus Radar com sucesso!");
                          }}
                          title="Publicar no Radar"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        </Button>
                      )}

                      {teaser.status === "PUBLISHED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            await cancelTeaser(teaser.id);
                            showToast("Teaser cancelado.");
                          }}
                          title="Cancelar Teaser"
                        >
                          <XCircle className="w-4 h-4 text-red-400" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (confirm("Desejas eliminar este teaser?")) {
                            await deleteTeaser(teaser.id);
                            showToast("Teaser eliminado.");
                          }
                        }}
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>

                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Simulator Modal */}
      {previewTeaser && (
        <Modal
          isOpen={Boolean(previewTeaser)}
          onClose={() => setPreviewTeaser(null)}
          title={`Simulação Lotus Radar — ${previewTeaser.codename}`}
        >
          <div className="py-2 flex justify-center">
            <LiveRadarTeaserPreview teaser={previewTeaser} />
          </div>
        </Modal>
      )}
    </div>
  );
}
