"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { LivePushNotificationPreview } from "@/components/preview/LivePushNotificationPreview";
import { useOrgStore } from "@/stores/useOrgStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { SystemNotificationLog, NotificationType } from "@/core/domain/notification";
import { formatDateTime } from "@/lib/utils";
import {
  Bell,
  Sparkles,
  Shield,
  Radio,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  TrendingUp,
  Smartphone,
  Eye,
  Send,
  Lock,
} from "lucide-react";

export default function NotificationsPage() {
  const { getActiveOrg } = useOrgStore();
  const activeOrg = getActiveOrg();
  const { getLogsByOrg, simulateTriggerNotification } = useNotificationStore();

  const logs = getLogsByOrg(activeOrg?.id || "org_1");
  const [selectedNotification, setSelectedNotification] = React.useState<SystemNotificationLog | undefined>(
    logs[0]
  );
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSimulateTrigger = (type: NotificationType) => {
    let title = "";
    let body = "";
    let target: "event" | "teaser" = "event";
    let targetId = "event_1";
    let recipients = activeOrg?.followers_count || 12450;

    if (type === "PROMOTER_NEW_EVENT") {
      title = `${activeOrg?.name || "Sublime Productions"} publicou um novo evento!`;
      body = "Sublime Open Air 2026 foi publicado no Lotus. Bilhetes disponíveis.";
      target = "event";
      targetId = "event_1";
    } else if (type === "RADAR_TEASER_REVEALED") {
      title = "✨ REVEAL NO LOTUS RADAR!";
      body = "O teaser PROJECT_TITAN foi agora revelado no Lotus com todos os detalhes.";
      target = "teaser";
      targetId = "teaser_1";
      recipients = 842;
    } else {
      title = "Atualização de Horário no Teu Evento Guardado";
      body = "O horário de início de Aurora Modular Night foi atualizado para as 20:00.";
      target = "event";
      targetId = "event_2";
      recipients = 530;
    }

    const createdLog = simulateTriggerNotification(
      activeOrg?.id || "org_1",
      type,
      title,
      body,
      target,
      targetId,
      recipients
    );

    setSelectedNotification(createdLog);
    showToast(`🔔 Notificação de sistema enviada para ${recipients.toLocaleString("pt-PT")} utilizadores!`);
  };

  const totalDelivered = logs.reduce((acc, curr) => acc + curr.delivered_count, 0);
  const totalOpens = logs.reduce((acc, curr) => acc + curr.open_count, 0);
  const avgOpenRate = totalDelivered > 0 ? ((totalOpens / totalDelivered) * 100).toFixed(1) : "34.8";

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
        title="Histórico & Notificações de Sistema"
        subtitle="Registo transparente de notificações transacionais enviadas automaticamente aos seguidores e utilizadores interessados."
      />

      {/* System Triggering & Anti-Spam Safety Banner */}
      <div className="p-4 rounded-2xl bg-[#121824] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#161F30] flex items-center justify-center text-[#A3E635] shrink-0 border border-white/5">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Política Anti-Spam & Notificações de Ação Legítima</h4>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
              As notificações são disparadas estritamente pelo ecossistema Lotus quando ocorrem ações reais (ex: publicação de eventos, reveals de teasers no Radar ou alterações de horários).
            </p>
          </div>
        </div>
        <Badge variant="lime" className="shrink-0">
          Proteção do Utilizador
        </Badge>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card isGlass>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase">Alertas Enviados</span>
            <Bell className="w-4 h-4 text-[#A3E635]" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{logs.length}</span>
            <span className="text-xs text-[#A3E635] font-semibold">100% Entregues</span>
          </div>
          <p className="text-xs text-[#64748B] mt-2">Disparos automáticos verificados</p>
        </Card>

        <Card isGlass>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase">Alcance Total</span>
            <Smartphone className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{totalDelivered.toLocaleString("pt-PT")}</span>
            <span className="text-xs text-cyan-400 font-semibold">dispositivos</span>
          </div>
          <p className="text-xs text-[#64748B] mt-2">Audiência impactada no telemóvel</p>
        </Card>

        <Card isGlass>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase">Taxa Média de Abertura</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{avgOpenRate}%</span>
            <span className="text-xs text-emerald-400 font-semibold">+8.2% vs média</span>
          </div>
          <p className="text-xs text-[#64748B] mt-2">Aberturas diretas via push</p>
        </Card>

        <Card isGlass>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase">Deep Links Ativos</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">lotus://</span>
            <span className="text-xs text-[#94A3B8]">100% compatível</span>
          </div>
          <p className="text-xs text-[#64748B] mt-2">Abertura em foreground / background</p>
        </Card>
      </div>

      {/* Main Grid: Logs Table (7 cols) / Live Push Simulator (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Logs Table & Simulation Triggers */}
        <div className="lg:col-span-7 space-y-6">
          {/* Action Simulation Box */}
          <Card isGlass className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-[#A3E635]" />
                <span>Simulador de Gatilhos de Sistema (Testes)</span>
              </h3>
              <span className="text-[10px] text-[#64748B]">Ambiente de Desenvolvimento</span>
            </div>

            <p className="text-xs text-[#94A3B8]">
              Testa o envio e o aspeto visual dos diferentes tipos de notificações geradas automaticamente pelas ações da organização:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleSimulateTrigger("PROMOTER_NEW_EVENT")}
                className="p-3 rounded-xl bg-[#121824] border border-white/10 hover:border-[#A3E635]/50 text-left transition-all group cursor-pointer"
              >
                <span className="text-[10px] font-bold text-[#A3E635] block uppercase">Novo Evento</span>
                <span className="text-xs font-bold text-white block mt-0.5 group-hover:text-[#A3E635] transition-colors">
                  Aos Seguidores
                </span>
                <span className="text-[10px] text-[#64748B] mt-1 block">12.4k destinatários</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateTrigger("RADAR_TEASER_REVEALED")}
                className="p-3 rounded-xl bg-[#121824] border border-white/10 hover:border-purple-500/50 text-left transition-all group cursor-pointer"
              >
                <span className="text-[10px] font-bold text-purple-400 block uppercase">Lotus Radar</span>
                <span className="text-xs font-bold text-white block mt-0.5 group-hover:text-purple-300 transition-colors">
                  Reveal de Teaser
                </span>
                <span className="text-[10px] text-[#64748B] mt-1 block">842 inscritos</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateTrigger("EVENT_TIME_CHANGED")}
                className="p-3 rounded-xl bg-[#121824] border border-white/10 hover:border-amber-500/50 text-left transition-all group cursor-pointer"
              >
                <span className="text-[10px] font-bold text-amber-400 block uppercase">Alteração</span>
                <span className="text-xs font-bold text-white block mt-0.5 group-hover:text-amber-300 transition-colors">
                  Evento Guardado
                </span>
                <span className="text-[10px] text-[#64748B] mt-1 block">530 interessados</span>
              </button>
            </div>
          </Card>

          {/* Logs Table */}
          <Card isGlass className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Histórico de Disparos de Sistema</h3>
              <Badge variant="lime">Live Feed</Badge>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mensagem & Tipo</TableHead>
                  <TableHead>Destinatários</TableHead>
                  <TableHead>Aberturas</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Preview</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className={selectedNotification?.id === log.id ? "bg-[#161F30]/80" : ""}
                  >
                    <TableCell>
                      <div>
                        <span className="text-xs font-bold text-white block truncate max-w-xs">
                          {log.title}
                        </span>
                        <span className="text-[10px] text-[#A3E635] font-mono block">
                          {log.deep_link.url}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-[#CBD5E1]">
                      {log.delivered_count.toLocaleString("pt-PT")}
                    </TableCell>

                    <TableCell className="text-xs font-bold text-emerald-400">
                      {log.open_count.toLocaleString("pt-PT")}{" "}
                      <span className="text-[10px] text-[#64748B] font-normal">
                        ({((log.open_count / log.delivered_count) * 100).toFixed(0)}%)
                      </span>
                    </TableCell>

                    <TableCell className="text-[11px] text-[#94A3B8]">
                      {formatDateTime(log.created_at)}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedNotification(log)}
                        title="Ver no simulador de push"
                      >
                        <Eye className="w-4 h-4 text-[#A3E635]" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Right Column: Live Push Simulator (5 cols) */}
        <div className="lg:col-span-5 hidden lg:block">
          <LivePushNotificationPreview notification={selectedNotification} />
        </div>
      </div>
    </div>
  );
}
