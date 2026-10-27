"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { LiveMobilePreview } from "@/components/preview/LiveMobilePreview";
import { ImageDropzone } from "@/components/forms/ImageDropzone";
import { useOrgStore } from "@/stores/useOrgStore";
import { useEventStore } from "@/stores/useEventStore";
import { useVenueStore } from "@/stores/useVenueStore";
import { EVENT_CATEGORIES, LotusEvent, TicketStatus } from "@/core/domain/event";
import {
  ArrowLeft,
  Calendar,
  Check,
  MapPin,
  Sparkles,
  Ticket,
  Save,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { getActiveOrg } = useOrgStore();
  const activeOrg = getActiveOrg();
  const { getEventById, updateEvent } = useEventStore();
  const { venues } = useVenueStore();

  const existingEvent = getEventById(eventId);

  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<Partial<LotusEvent>>(() => ({
    ...existingEvent,
  }));


  const steps = [
    { number: 1, label: "Básico", title: "Informações Gerais" },
    { number: 2, label: "Data & Local", title: "Data, Horário e Recinto" },
    { number: 3, label: "Bilhetes", title: "Preços & Bilheteira" },
    { number: 4, label: "Media", title: "Poster & Imagens" },
    { number: 5, label: "Publicar", title: "Guardar Alterações" },
  ];

  const handleCategoryToggle = (category: string) => {
    const current = formData.categoria || [];
    if (current.includes(category)) {
      setFormData({ ...formData, categoria: current.filter((c) => c !== category) });
    } else {
      setFormData({ ...formData, categoria: [...current, category] });
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateEvent(eventId, formData);
      setToastMessage("Evento atualizado com sucesso!");
      setTimeout(() => {
        router.push(`/app/events/${eventId}`);
      }, 800);
    } finally {
      setIsSubmitting(false);
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
          href={`/app/events/${eventId}`}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#94A3B8] hover:text-[#A3E635] mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Evento</span>
        </Link>
        <PageHeader
          title={`Editar: ${formData.name || "Evento"}`}
          subtitle="Modifica as informações do evento. A simulação da app Lotus atualiza em tempo real."
        />
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 overflow-x-auto gap-4">
        {steps.map((step) => {
          const isCurrent = currentStep === step.number;
          const isPassed = currentStep > step.number;

          return (
            <button
              key={step.number}
              onClick={() => setCurrentStep(step.number)}
              className={cn(
                "flex items-center gap-2.5 text-xs font-medium transition-colors shrink-0",
                isCurrent
                  ? "text-[#A3E635] font-bold"
                  : isPassed
                  ? "text-[#F8FAFC]"
                  : "text-[#64748B]"
              )}
            >
              <span
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all",
                  isCurrent
                    ? "bg-[#A3E635] text-black shadow-[0_0_12px_rgba(163,230,53,0.5)]"
                    : isPassed
                    ? "bg-[#1E293B] text-[#A3E635] border border-[#A3E635]/40"
                    : "bg-[#121824] text-[#64748B] border border-white/10"
                )}
              >
                {isPassed ? <Check className="w-3.5 h-3.5" /> : step.number}
              </span>
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Split-Screen Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form column */}
        <div className="lg:col-span-7 space-y-6">
          <Card isGlass className="space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-[#A3E635]">Passo {currentStep}:</span>
              <span>{steps[currentStep - 1].title}</span>
            </h2>

            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                <Input
                  label="Nome do Evento *"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                    Categorias Lotus *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EVENT_CATEGORIES.map((cat) => {
                      const isSelected = formData.categoria?.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleCategoryToggle(cat)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150",
                            isSelected
                              ? "bg-[#A3E635]/20 text-[#A3E635] border-[#A3E635]/50 shadow-[0_0_10px_rgba(163,230,53,0.2)]"
                              : "bg-[#121824] text-[#94A3B8] border-white/10 hover:border-white/20 hover:text-white"
                          )}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Textarea
                  label="Descrição do Evento *"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                />
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Data e Hora de Início *"
                    type="datetime-local"
                    value={formData.start_date ? formData.start_date.slice(0, 16) : ""}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    leftIcon={<Calendar className="w-4 h-4" />}
                  />
                  <Input
                    label="Data e Hora de Término"
                    type="datetime-local"
                    value={formData.end_date ? formData.end_date.slice(0, 16) : ""}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    leftIcon={<Calendar className="w-4 h-4" />}
                  />
                </div>

                <Select
                  label="Recinto Registado"
                  options={[
                    { value: "", label: "Selecionar um local..." },
                    ...venues.map((v) => ({
                      value: v.name,
                      label: `${v.name} (${v.city})`,
                    })),
                  ]}
                  value={formData.venue_name || ""}
                  onChange={(e) => {
                    const venue = venues.find((v) => v.name === e.target.value);
                    setFormData({
                      ...formData,
                      venue_name: e.target.value,
                      location: venue?.city || formData.location,
                    });
                  }}
                />


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nome do Local (Manual)"
                    value={formData.venue_name || ""}
                    onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />
                  <Input
                    label="Cidade *"
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#121824] border border-white/10">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_free || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_free: e.target.checked,
                          price_min: e.target.checked ? 0 : formData.price_min,
                        })
                      }
                      className="w-4 h-4 rounded text-[#A3E635] accent-[#A3E635]"
                    />
                    <span className="text-sm font-medium text-white">
                      Evento de Entrada Gratuita
                    </span>
                  </label>
                </div>

                {!formData.is_free && (
                  <Input
                    label="Preço Mínimo (€) *"
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.price_min || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, price_min: parseFloat(e.target.value) || 0 })
                    }
                  />
                )}

                <Select
                  label="Disponibilidade dos Bilhetes"
                  options={[
                    { value: "AVAILABLE", label: "Bilhetes Disponíveis" },
                    { value: "SOON", label: "Em Breve" },
                    { value: "SOLD_OUT", label: "Esgotado" },
                  ]}
                  value={formData.ticket_status || "AVAILABLE"}
                  onChange={(e) =>
                    setFormData({ ...formData, ticket_status: e.target.value as TicketStatus })
                  }
                />

                <Input
                  label="Link da Bilheteira Oficial"
                  value={formData.ticket_url || ""}
                  onChange={(e) => setFormData({ ...formData, ticket_url: e.target.value })}
                  leftIcon={<Ticket className="w-4 h-4" />}
                />
              </div>
            )}

            {/* Step 4 */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-fade-in">
                <ImageDropzone
                  value={formData.image || ""}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  label="Poster Oficial do Evento *"
                />
              </div>
            )}

            {/* Step 5 */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-fade-in">
                <div className="p-4 rounded-xl bg-[#121824] border border-white/10 space-y-2 text-xs">
                  <h4 className="font-semibold text-[#A3E635] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Resumo das Alterações
                  </h4>
                  <p className="text-white">
                    Nome: <strong>{formData.name}</strong>
                  </p>
                  <p className="text-[#94A3B8]">
                    Local: {formData.venue_name} ({formData.location})
                  </p>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Anterior
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                {currentStep < 5 ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setCurrentStep(currentStep + 1)}
                  >
                    Seguinte
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSave}
                    isLoading={isSubmitting}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    <span>Guardar Alterações</span>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Simulator */}
        <div className="lg:col-span-5 hidden lg:block">
          <LiveMobilePreview
            event={formData}
            organizerName={activeOrg?.name}
          />
        </div>
      </div>
    </div>
  );
}
