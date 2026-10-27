"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useVenueStore } from "@/stores/useVenueStore";
import { useEventStore } from "@/stores/useEventStore";
import { useOrgStore } from "@/stores/useOrgStore";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  MapPin,
  Users,
  Mail,
  Compass,
  Edit,
  Plus,
  CalendarDays,
  Sparkles,
  Building2,
  CheckCircle,
} from "lucide-react";

export default function VenueDetailPage() {
  const params = useParams();
  const venueId = params.id as string;
  const { getVenueById, updateVenue } = useVenueStore();
  const { events } = useEventStore();
  const { getActiveOrg } = useOrgStore();
  const activeOrg = getActiveOrg();

  const venue = getVenueById(venueId) || {
    id: venueId,
    organization_id: activeOrg?.id || "",
    name: "Recinto",
    address: "",
    city: "Lisboa",
    capacity: 0,
    created_at: new Date().toISOString(),
  };

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [name, setName] = React.useState(venue.name);
  const [address, setAddress] = React.useState(venue.address);
  const [city, setCity] = React.useState(venue.city);
  const [capacity, setCapacity] = React.useState(venue.capacity?.toString() || "");
  const [contactEmail, setContactEmail] = React.useState(venue.contact_email || "");
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  // Filter events hosted at this venue
  const venueEvents = events.filter(
    (e) => e.venue_id === venue.id || (e.venue_name && e.venue_name.toLowerCase().includes(venue.name.toLowerCase()))
  );

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateVenue(venue.id, {
        name,
        address,
        city,
        capacity: parseInt(capacity) || venue.capacity,
        contact_email: contactEmail,
      });
      setIsEditModalOpen(false);
      setToastMessage("Dados do recinto atualizados com sucesso!");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
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
          href="/app/venues"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#94A3B8] hover:text-[#A3E635] mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar aos Recintos</span>
        </Link>

        <PageHeader
          title={venue.name}
          subtitle={`Espaço registado em ${venue.city} • Lotação de ${venue.capacity?.toLocaleString("pt-PT")} pessoas`}
          actions={
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(true)}>
                <Edit className="w-4 h-4" />
                <span>Editar Recinto</span>
              </Button>
              <Link href="/app/events/new">
                <Button variant="primary" size="sm">
                  <Plus className="w-4 h-4" />
                  <span>Criar Evento Aqui</span>
                </Button>
              </Link>
            </div>
          }
        />
      </div>

      {/* Hero Banner & Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Venue Cover & Details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-white/10 bg-[#161F30]">
            {venue.photo_url ? (
              <img
                src={venue.photo_url}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#64748B]">
                <Building2 className="w-12 h-12" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
              <div>
                <span className="text-xs font-semibold text-[#A3E635] uppercase tracking-wider block mb-1">
                  Recinto Lotus Verificado
                </span>
                <h2 className="text-2xl font-bold text-white drop-shadow-md">
                  {venue.name}
                </h2>
              </div>
            </div>
          </div>

          {/* Events hosted at this venue */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#A3E635]" />
                <span>Eventos Agendados Neste Recinto ({venueEvents.length})</span>
              </h3>
            </div>

            {venueEvents.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#121824]/60 border border-white/10 text-center">
                <p className="text-xs text-[#94A3B8]">
                  Ainda não existem eventos associados a este espaço.
                </p>
                <Link href="/app/events/new" className="inline-block mt-3">
                  <Button variant="secondary" size="sm">
                    Agendar Primeiro Evento
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {venueEvents.map((evt) => (
                    <TableRow key={evt.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={evt.image}
                            alt={evt.name}
                            className="w-10 h-10 rounded-lg object-cover border border-white/10"
                          />
                          <div>
                            <span className="font-semibold text-white text-sm block">
                              {evt.name}
                            </span>
                            <span className="text-[11px] text-[#A3E635]">
                              {evt.categoria[0]}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs text-white">
                          {formatDateTime(evt.start_date)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={evt.status} />
                      </TableCell>

                      <TableCell>
                        <span className="text-xs text-white font-medium">
                          {formatCurrency(evt.price_min, evt.is_free)}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <Link href={`/app/events/${evt.id}`}>
                          <Button variant="secondary" size="sm" className="text-xs py-1 px-2.5">
                            Gerir
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Right Column: Key Details Card */}
        <div className="lg:col-span-4 space-y-4">
          <Card isGlass className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A3E635]" />
              <span>Especificações do Espaço</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#121824] border border-white/5 space-y-1">
                <span className="text-[#64748B] uppercase tracking-wider text-[10px] font-bold">
                  Morada Completa
                </span>
                <div className="text-white font-medium flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#A3E635] shrink-0 mt-0.5" />
                  <span>
                    {venue.address}, {venue.city}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#121824] border border-white/5 space-y-1">
                <span className="text-[#64748B] uppercase tracking-wider text-[10px] font-bold">
                  Lotação Máxima
                </span>
                <div className="text-white font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#A3E635] shrink-0" />
                  <span>{venue.capacity?.toLocaleString("pt-PT")} pessoas</span>
                </div>
              </div>

              {venue.coordenadas && (
                <div className="p-3 rounded-xl bg-[#121824] border border-white/5 space-y-1">
                  <span className="text-[#64748B] uppercase tracking-wider text-[10px] font-bold">
                    Coordenadas GPS
                  </span>
                  <div className="text-white font-medium flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#A3E635] shrink-0" />
                    <span>
                      {venue.coordenadas.latitude.toFixed(4)}, {venue.coordenadas.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              )}

              {venue.contact_email && (
                <div className="p-3 rounded-xl bg-[#121824] border border-white/5 space-y-1">
                  <span className="text-[#64748B] uppercase tracking-wider text-[10px] font-bold">
                    Contacto de Booking
                  </span>
                  <div className="text-white font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#A3E635] shrink-0" />
                    <span className="truncate">{venue.contact_email}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Venue Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Dados do Recinto"
        description="Atualiza a morada, lotação ou contactos associados a este espaço."
        maxWidth="md"
      >
        <form onSubmit={handleUpdate} className="space-y-4 pt-2">
          <Input
            label="Nome do Espaço *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cidade *"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <Input
              label="Lotação Estimada"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>

          <Input
            label="Morada Completa"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Input
            label="Email de Contacto"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar Alterações
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
