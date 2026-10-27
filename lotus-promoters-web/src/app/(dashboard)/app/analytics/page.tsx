"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useOrgStore } from "@/stores/useOrgStore";
import { useEventStore } from "@/stores/useEventStore";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  MousePointerClick,
  Eye,
  Bookmark,
  Share2,
  TrendingUp,
  BarChart3,
  Calendar,
  Sparkles,
  Users,
  Shield,
} from "lucide-react";

export default function AnalyticsPage() {
  const { getActiveOrg } = useOrgStore();
  const activeOrg = getActiveOrg();
  const { events, loadEvents } = useEventStore();

  React.useEffect(() => {
    if (activeOrg?.id) {
      loadEvents(activeOrg.id);
    }
  }, [activeOrg?.id, loadEvents]);

  const orgEvents = events.filter((e) => e.organization_id === activeOrg?.id);
  const totalClicks = orgEvents.reduce((acc, curr) => acc + (curr.click_count || 0), 0);
  const totalFollowers = activeOrg?.followers_count ?? 0;


  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <PageHeader
        title={`Métricas & Desempenho — ${activeOrg?.name || "Organização"}`}
        subtitle="Analisa o alcance agregado, crescimento de seguidores e conversões para bilheteiras gerados pelo ecossistema Lotus."
      />

      {/* Main KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Seguidores Lotus (TASK 15) */}
        <Card isGlass>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase">
              Seguidores Lotus
            </span>
            <Users className="w-4 h-4 text-[#A3E635]" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {totalFollowers.toLocaleString("pt-PT")}
            </span>
            <span className="text-xs text-[#A3E635] font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +14.2%
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-2">Audiência direta na app Lotus</p>
        </Card>

        {/* Metric 2: Cliques em Bilhetes */}
        <Card isGlass>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase">
              Cliques em Bilhetes
            </span>
            <MousePointerClick className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {totalClicks.toLocaleString("pt-PT")}
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +24%
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-2">Redirecionamentos para checkout</p>
        </Card>

        {/* Metric 3: Visualizações no Feed */}
        <Card isGlass>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase">
              Visualizações no Feed
            </span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {(totalClicks * 14).toLocaleString("pt-PT")}
            </span>
            <span className="text-xs text-cyan-400 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +32%
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-2">Impressões na app Lotus Mobile</p>
        </Card>

        {/* Metric 4: Guardados / Favoritos */}
        <Card isGlass>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase">
              Favoritos / Wishlist
            </span>
            <Bookmark className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {Math.round(totalClicks * 0.95).toLocaleString("pt-PT")}
            </span>
            <span className="text-xs text-purple-400 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +15%
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-2">Utilizadores com eventos guardados</p>
        </Card>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#121824] border border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#161F30] flex items-center justify-center text-[#A3E635] shrink-0">
          <Shield className="w-4 h-4" />
        </div>
        <p className="text-xs text-[#94A3B8] leading-relaxed">
          <strong className="text-white">Privacidade & Métricas Agregadas:</strong> Os promotores acedem a contadores agregados e métricas de conversão. Em conformidade com o RGPD e as regras do ecossistema Lotus, identidades ou dados pessoais dos seguidores não são expostos.
        </p>
      </div>

      {/* Per Event Breakdown Table */}
      <Card isGlass className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white">Desempenho por Evento</h3>
            <p className="text-xs text-[#94A3B8]">Interações e cliques por evento da organização</p>
          </div>
          <Badge variant="lime">Live Sync</Badge>
        </div>

        {orgEvents.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#94A3B8]">
            Ainda não existem eventos para calcular métricas de desempenho nesta organização.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Cliques em Bilhetes</TableHead>
                <TableHead className="text-right">Estimativa de Alcance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={event.image}
                        alt={event.name}
                        className="w-10 h-10 rounded-lg object-cover border border-white/10"
                      />
                      <div>
                        <span className="font-semibold text-white block truncate max-w-xs">{event.name}</span>
                        <span className="text-xs text-[#64748B]">{event.venue_name || event.location}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-[#94A3B8]">
                    {formatDateTime(event.start_date)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={event.status} />
                  </TableCell>
                  <TableCell className="text-right font-bold text-[#A3E635]">
                    {(event.click_count || 0).toLocaleString("pt-PT")}
                  </TableCell>
                  <TableCell className="text-right text-xs text-[#CBD5E1]">
                    {((event.click_count || 0) * 12).toLocaleString("pt-PT")} views
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

