"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useVenueStore } from "@/stores/useVenueStore";
import { useOrgStore } from "@/stores/useOrgStore";
import { Venue } from "@/core/domain/venue";
import {
  Plus,
  MapPin,
  Users,
  Mail,
  Building2,
  Trash2,
  Search,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export default function VenuesPage() {
  const { getActiveOrg } = useOrgStore();
  const activeOrg = getActiveOrg();
  const { venues, loadVenues, addVenue, deleteVenue, isLoadingVenues } = useVenueStore();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("Lisboa");
  const [capacity, setCapacity] = React.useState("1000");
  const [photoUrl, setPhotoUrl] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (activeOrg?.id) {
      loadVenues(activeOrg.id);
    }
  }, [activeOrg?.id, loadVenues]);

  const orgVenues = venues.filter((v) => v.organization_id === activeOrg?.id);

  const filteredVenues = orgVenues.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !activeOrg?.id) return;

    setIsSubmitting(true);
    try {
      await addVenue({
        organization_id: activeOrg.id,
        name,
        address,
        city,
        capacity: parseInt(capacity) || 500,
        photo_url:
          photoUrl ||
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
        contact_email: contactEmail,
      });

      setIsModalOpen(false);
      setName("");
      setAddress("");
      setPhotoUrl("");
      setContactEmail("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Desejas remover este recinto?")) {
      await deleteVenue(id);
    }
  };


  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Locais & Recintos (Venues)"
        subtitle="Gere os espaços físicos, moradas e lotações onde realizas os teus eventos no ecossistema Lotus."
        actions={
          <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" />
            <span>Adicionar Recinto</span>
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Pesquisar recinto por nome, cidade ou morada..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#121824] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]/40 transition-colors"
        />
      </div>

      {/* Venues Grid */}
      {filteredVenues.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#121824]/40 border border-white/10 text-center space-y-3">
          <Building2 className="w-10 h-10 text-[#64748B] mx-auto" />
          <h3 className="text-base font-semibold text-white">Nenhum recinto encontrado</h3>
          <p className="text-xs text-[#94A3B8]">
            Não foram encontrados recintos para a pesquisa atual.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <Card key={venue.id} isGlass isHoverable className="p-0 overflow-hidden group flex flex-col justify-between">
              <div>
                {/* Venue Image */}
                <div className="relative w-full h-44 bg-[#161F30] overflow-hidden">
                  {venue.photo_url ? (
                    <img
                      src={venue.photo_url}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#64748B]">
                      <Building2 className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F141F] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-base font-bold text-white drop-shadow-md">
                      {venue.name}
                    </h3>
                  </div>
                </div>

                {/* Venue Details */}
                <div className="p-5 space-y-3 text-xs">
                  <div className="flex items-start gap-2 text-[#94A3B8]">
                    <MapPin className="w-4 h-4 text-[#A3E635] shrink-0 mt-0.5" />
                    <span>
                      {venue.address}, {venue.city}
                    </span>
                  </div>

                  {venue.capacity && (
                    <div className="flex items-center gap-2 text-[#CBD5E1]">
                      <Users className="w-4 h-4 text-[#64748B] shrink-0" />
                      <span>Lotação: {venue.capacity.toLocaleString("pt-PT")} pessoas</span>
                    </div>
                  )}

                  {venue.contact_email && (
                    <div className="flex items-center gap-2 text-[#64748B]">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="truncate">{venue.contact_email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="px-5 py-3 border-t border-white/[0.08] flex items-center justify-between bg-[#161F30]/40">
                <Link
                  href={`/app/venues/${venue.id}`}
                  className="text-xs font-semibold text-[#A3E635] hover:underline flex items-center gap-1"
                >
                  <span>Ver Detalhes & Eventos</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={(e) => handleDelete(venue.id, e)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Venue Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Recinto / Venue"
        description="Regista um espaço para usar nos teus eventos com morada e dados fixos."
        maxWidth="md"
      >
        <form onSubmit={handleCreateVenue} className="space-y-4 pt-2">
          <Input
            label="Nome do Espaço *"
            placeholder="Ex: Pavilhão Carlos Lopes, Coliseu dos Recreios"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cidade *"
              placeholder="Ex: Lisboa, Porto..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <Input
              label="Lotação Estimada"
              type="number"
              placeholder="Ex: 2500"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>

          <Input
            label="Morada Completa"
            placeholder="Rua, Número, Código Postal"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Input
            label="Email de Contacto / Booking"
            placeholder="booking@venue.pt"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />

          <Input
            label="URL da Fotografia do Espaço"
            placeholder="https://..."
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar Recinto
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
