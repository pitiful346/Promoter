"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { OrganizationMember, MemberRole } from "@/core/domain/organization";
import { useOrgStore } from "@/stores/useOrgStore";
import { firestoreOrganizationRepository } from "@/infrastructure/firebase/FirestoreOrganizationRepository";
import { formatDate } from "@/lib/utils";
import { UserPlus, Shield, ShieldCheck, Mail, Trash2, CheckCircle } from "lucide-react";

export default function MembersPage() {
  const { getActiveOrg } = useOrgStore();
  const activeOrg = getActiveOrg();

  const [members, setMembers] = React.useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(Boolean(activeOrg?.id));
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<MemberRole>("EDITOR");
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!activeOrg?.id) {
      return;
    }
    let isCancelled = false;
    firestoreOrganizationRepository.getMembers(activeOrg.id).then((m) => {
      if (!isCancelled) {
        setMembers(m);
        setIsLoading(false);
      }
    }).catch(() => {
      if (!isCancelled) {
        setIsLoading(false);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [activeOrg?.id]);


  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeOrg?.id) return;

    try {
      const newMember = await firestoreOrganizationRepository.inviteMember(activeOrg.id, inviteEmail, inviteRole);
      setMembers([...members, newMember]);
      setIsInviteOpen(false);
      setInviteEmail("");
      showToast(`Convite enviado para ${inviteEmail}`);
    } catch {
      showToast("Erro ao convidar membro. Tenta novamente.");
    }
  };

  const handleRemove = async (id: string) => {
    if (!activeOrg?.id) return;
    if (confirm("Tens a certeza que pretendes remover este membro?")) {
      try {
        await firestoreOrganizationRepository.removeMember(activeOrg.id, id);
        setMembers(members.filter((m) => m.id !== id));
        showToast("Membro removido da organização.");
      } catch {
        showToast("Erro ao remover membro.");
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };


  const roleColors: Record<MemberRole, "lime" | "secondary" | "default" | "warning"> = {
    OWNER: "lime",
    ADMIN: "secondary",
    EDITOR: "default",
    VIEWER: "default",
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161F30] border border-[#A3E635]/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up">
          <CheckCircle className="w-5 h-5 text-[#A3E635]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <PageHeader
        title={`Equipa & Permissões — ${activeOrg?.name || "Organização"}`}
        subtitle="Gere quem tem acesso para criar, editar, publicar eventos e gerir venues nesta organização."
        actions={
          <Button variant="primary" size="md" onClick={() => setIsInviteOpen(true)}>
            <UserPlus className="w-4 h-4" />
            <span>Convidar Membro</span>
          </Button>
        }
      />

      {/* Members Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Membro</TableHead>
            <TableHead>Papel (Role)</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Data de Entrada</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              {/* Member name & email */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#1E293B] border border-white/10 flex items-center justify-center font-bold text-xs text-[#A3E635]">
                    {member.display_name
                      ? member.display_name.slice(0, 2).toUpperCase()
                      : "US"}
                  </div>
                  <div>
                    <span className="font-semibold text-white block text-sm">
                      {member.display_name || member.email}
                    </span>
                    <span className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" />
                      {member.email}
                    </span>
                  </div>
                </div>
              </TableCell>

              {/* Role */}
              <TableCell>
                <Badge variant={roleColors[member.role]}>
                  {member.role === "OWNER" ? (
                    <ShieldCheck className="w-3 h-3 text-[#A3E635]" />
                  ) : (
                    <Shield className="w-3 h-3 text-[#94A3B8]" />
                  )}
                  <span>{member.role}</span>
                </Badge>
              </TableCell>

              {/* Status */}
              <TableCell>
                {member.status === "ACTIVE" ? (
                  <span className="text-xs text-emerald-400 font-medium">Ativo</span>
                ) : (
                  <span className="text-xs text-amber-300 font-medium">
                    Convite Pendente
                  </span>
                )}
              </TableCell>

              {/* Joined date */}
              <TableCell>
                <span className="text-xs text-[#94A3B8]">
                  {formatDate(member.joined_at)}
                </span>
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                {member.role !== "OWNER" && (
                  <button
                    onClick={() => handleRemove(member.id)}
                    className="p-2 rounded-lg text-[#64748B] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remover membro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Permissions Matrix Reference Card */}
      <Card isGlass className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#A3E635]" />
          <span>Matriz de Permissões (RBAC)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#121824] border border-white/5 space-y-2">
            <span className="font-bold text-[#A3E635] block">OWNER</span>
            <p className="text-[#94A3B8]">
              Acesso total, gestão de faturação, remoção da organização, gestão de todos os membros e publicação de eventos.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#121824] border border-white/5 space-y-2">
            <span className="font-bold text-white block">ADMIN</span>
            <p className="text-[#94A3B8]">
              Criar, editar e publicar eventos, gerir locais/venues e convidar novos editores/viewers.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#121824] border border-white/5 space-y-2">
            <span className="font-bold text-[#CBD5E1] block">EDITOR</span>
            <p className="text-[#94A3B8]">
              Criar eventos, guardar rascunhos, submeter para aprovação e gerir recintos.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#121824] border border-white/5 space-y-2">
            <span className="font-bold text-[#64748B] block">VIEWER</span>
            <p className="text-[#94A3B8]">
              Apenas consulta de métricas de cliques, visualização de rascunhos e lista de eventos.
            </p>
          </div>
        </div>
      </Card>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Convidar Novo Colaborador"
        description="Envia um convite por email para adicionar um membro à equipa desta organização."
        maxWidth="md"
      >
        <form onSubmit={handleInvite} className="space-y-4 pt-2">
          <Input
            label="Email do Colaborador *"
            type="email"
            placeholder="colega@produtora.pt"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Select
            label="Nível de Acesso (Role) *"
            options={[
              { value: "ADMIN", label: "Admin (Pode publicar e gerir equipa)" },
              { value: "EDITOR", label: "Editor (Pode criar e editar eventos)" },
              { value: "VIEWER", label: "Viewer (Apenas leitura e métricas)" },
            ]}
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as MemberRole)}
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsInviteOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Enviar Convite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
