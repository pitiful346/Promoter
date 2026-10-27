"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { LiveMobilePreview } from "@/components/preview/LiveMobilePreview";
import { ImageDropzone } from "@/components/forms/ImageDropzone";
import { PosterAIExtractor } from "@/components/ai/PosterAIExtractor";
import { ConfidenceBadge } from "@/components/ai/ConfidenceBadge";
import { useOrgStore } from "@/stores/useOrgStore";
import { useVenueStore } from "@/stores/useVenueStore";
import { useEventStore } from "@/stores/useEventStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { EVENT_CATEGORIES, LotusEvent, TicketStatus } from "@/core/domain/event";
import { ExtractedEventFields, PosterExtractionResult, VenueMatchResult } from "@/core/domain/ai";
import {
  ArrowLeft,
  Calendar,
  Check,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  Ticket,
  Upload,
  Eye,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  HelpCircle,
  FileText,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewEventPage() {
  const router = useRouter();
  const { getActiveOrg } = useOrgStore();
  const { user } = useAuthStore();
  const { createEvent } = useEventStore();
  const { venues } = useVenueStore();
  const activeOrg = getActiveOrg();

  // Mode Selection State
  const [creationMode, setCreationMode] = React.useState<"manual" | "ai">("manual");
  const [extractedFields, setExtractedFields] = React.useState<ExtractedEventFields | null>(null);
  const [venueMatchInfo, setVenueMatchInfo] = React.useState<VenueMatchResult | null>(null);
  const [importedPosterUrl, setImportedPosterUrl] = React.useState<string | null>(null);
  const [showPosterReference, setShowPosterReference] = React.useState<boolean>(true);

  // Wizard Step State
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Form State
  const [formData, setFormData] = React.useState<Partial<LotusEvent>>({
    name: "",
    description: "",
    location: "Lisboa",
    venue_name: "Pavilhão Carlos Lopes",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    start_date: "2026-10-31T23:00",
    end_date: "2026-11-01T06:00",
    price_min: 20.0,
    is_free: false,
    ticket_status: "AVAILABLE" as TicketStatus,
    ticket_url: "https://shotgun.live",
    categoria: ["Música & Festivais"],
    status: "DRAFT",
  });

  const steps = [
    { number: 1, label: "Básico", title: "Informações Gerais" },
    { number: 2, label: "Data & Local", title: "Data, Horário e Recinto" },
    { number: 3, label: "Bilhetes", title: "Preços & Bilheteira" },
    { number: 4, label: "Media", title: "Poster & Imagens" },
    { number: 5, label: "Publicar", title: "Revisão Final" },
  ];

  const handleCategoryToggle = (category: string) => {
    const current = formData.categoria || [];
    if (current.includes(category)) {
      setFormData({ ...formData, categoria: current.filter((c) => c !== category) });
    } else {
      setFormData({ ...formData, categoria: [...current, category] });
    }
  };

  const handleAiExtracted = (result: PosterExtractionResult, imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      ...result.normalized_event,
      image: imageUrl || result.normalized_event.image || prev.image,
    }));
    setExtractedFields(result.extracted_fields);
    setVenueMatchInfo(result.venue_match || null);
    setImportedPosterUrl(imageUrl);
    setCreationMode("manual"); // Move to review in form
    setCurrentStep(1);
  };

  const handleSaveDraft = async () => {
    if (!activeOrg?.id || !user?.uid) return;
    setIsSubmitting(true);
    try {
      await createEvent({
        ...formData as Omit<LotusEvent, "id" | "click_count" | "is_boosted" | "is_archived">,
        organization_id: activeOrg.id,
        status: "DRAFT",
        created_by: user.uid,
      });
      router.push("/app/events");
    } catch {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!activeOrg?.id || !user?.uid) return;
    setIsSubmitting(true);
    try {
      await createEvent({
        ...formData as Omit<LotusEvent, "id" | "click_count" | "is_boosted" | "is_archived">,
        organization_id: activeOrg.id,
        status: "SUBMITTED",
        created_by: user.uid,
      });
      router.push("/app/events");
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Back button & Page header */}
      <div>
        <Link
          href="/app/events"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#94A3B8] hover:text-[#A3E635] mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar aos Eventos</span>
        </Link>
        <PageHeader
          title="Criar Novo Evento"
          subtitle="Preenche as informações do evento ou usa a IA do Lotus para analisar e importar automaticamente um cartaz."
        />
      </div>

      {/* Mode Switcher Banner: Manual vs AI Import */}
      <div className="p-1.5 rounded-2xl bg-[#121824] border border-white/10 flex items-center gap-2 max-w-md">
        <button
          type="button"
          onClick={() => setCreationMode("manual")}
          className={cn(
            "flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-2",
            creationMode === "manual"
              ? "bg-[#1E293B] text-white shadow-sm border border-white/10"
              : "text-[#94A3B8] hover:text-white"
          )}
        >
          <FileText className="w-4 h-4" />
          <span>Criar Manualmente</span>
        </button>

        <button
          type="button"
          onClick={() => setCreationMode("ai")}
          className={cn(
            "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2",
            creationMode === "ai"
              ? "bg-[#A3E635] text-black shadow-[0_0_12px_rgba(163,230,53,0.4)]"
              : "text-[#A3E635] hover:text-white"
          )}
        >
          <Sparkles className="w-4 h-4" />
          <span>Importar Cartaz com IA</span>
        </button>
      </div>

      {/* AI Extraction Dropzone View */}
      {creationMode === "ai" && (
        <PosterAIExtractor
          venues={venues}
          onExtracted={handleAiExtracted}
          onCancel={() => setCreationMode("manual")}
        />
      )}

      {/* AI Extraction Success Notification Banner if fields were populated */}
      {creationMode === "manual" && extractedFields && (
        <div className="p-4 rounded-2xl bg-[#121824] border border-[#A3E635]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in shadow-[0_0_20px_rgba(163,230,53,0.1)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#A3E635]/20 border border-[#A3E635]/40 flex items-center justify-center text-[#A3E635] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-2">
                <span>Informações extraídas por IA a partir do cartaz</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#A3E635]/20 text-[#A3E635]">
                  Revisão Ativa
                </span>
              </p>
              <p className="text-[11px] text-[#94A3B8]">
                Revê e ajusta os campos destacados abaixo antes de guardar ou publicar o evento.
              </p>
            </div>
          </div>

          {importedPosterUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPosterReference(!showPosterReference)}
              className="text-xs shrink-0 gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showPosterReference ? "Ocultar Cartaz" : "Ver Cartaz Original"}</span>
            </Button>
          )}
        </div>
      )}

      {/* Stepper Navigation */}
      {creationMode === "manual" && (
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
      )}

      {/* Main Form & Simulator Section */}
      {creationMode === "manual" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Step Form Fields (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card isGlass className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-[#A3E635]">Passo {currentStep}:</span>
                  <span>{steps[currentStep - 1].title}</span>
                </h2>
                {extractedFields && (
                  <span className="text-[11px] text-[#94A3B8] flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#A3E635]" />
                    <span>Campos assistidos por IA</span>
                  </span>
                )}
              </div>

              {/* STEP 1: General Info */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                        Nome do Evento *
                      </label>
                      <ConfidenceBadge confidence={extractedFields?.name?.confidence} />
                    </div>
                    <Input
                      placeholder="Ex: Primavera Club Night, Workshop de Fotografia..."
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                        Categorias Lotus *
                      </label>
                      <ConfidenceBadge confidence={extractedFields?.category?.confidence} />
                    </div>
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

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                        Descrição Completa do Evento *
                      </label>
                      <ConfidenceBadge confidence={extractedFields?.description?.confidence} />
                    </div>
                    <Textarea
                      placeholder="Descreve o conceito, artistas confirmados, horários, acessibilidade e regras de entrada..."
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={5}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Date, Time & Venue */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                          Data e Hora de Início *
                        </label>
                        <ConfidenceBadge confidence={extractedFields?.start_date?.confidence} />
                      </div>
                      <Input
                        type="datetime-local"
                        value={formData.start_date ? formData.start_date.substring(0, 16) : ""}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        leftIcon={<Calendar className="w-4 h-4" />}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                          Data e Hora de Término
                        </label>
                        <ConfidenceBadge confidence={extractedFields?.end_date?.confidence} />
                      </div>
                      <Input
                        type="datetime-local"
                        value={formData.end_date ? formData.end_date.substring(0, 16) : ""}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        leftIcon={<Calendar className="w-4 h-4" />}
                      />
                    </div>
                  </div>

                  {/* Venue Match AI Status Pill */}
                  {venueMatchInfo && (
                    <div className="p-3 rounded-xl bg-[#121824] border border-white/10 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#A3E635]" />
                        <span className="text-[#94A3B8]">Associação de Recinto pela IA:</span>
                      </div>
                      {venueMatchInfo.matched ? (
                        <span className="font-semibold text-[#A3E635] flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{venueMatchInfo.venue_name} (Registado)</span>
                        </span>
                      ) : (
                        <span className="font-medium text-amber-400">
                          Recinto sugerido: {venueMatchInfo.venue_name || "A confirmar"}
                        </span>
                      )}
                    </div>
                  )}

                  <Select
                    label="Escolher Recinto / Venue Registado"
                    options={[
                      { value: "", label: "Selecionar um local registado..." },
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
                        venue_id: venue?.id,
                        location: venue?.city || formData.location,
                        coordenadas: venue?.coordenadas,
                      });
                    }}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                          Nome do Local (Manual)
                        </label>
                        <ConfidenceBadge confidence={extractedFields?.venue_name?.confidence} />
                      </div>
                      <Input
                        placeholder="Ex: Lux Frágil, Armazém 16"
                        value={formData.venue_name || ""}
                        onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                        leftIcon={<MapPin className="w-4 h-4" />}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                          Cidade / Zona *
                        </label>
                        <ConfidenceBadge confidence={extractedFields?.location?.confidence} />
                      </div>
                      <Input
                        placeholder="Ex: Lisboa, Porto, Braga..."
                        value={formData.location || ""}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Tickets & Price */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#121824] border border-white/10">
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
                        className="w-4 h-4 rounded text-[#A3E635] focus:ring-[#A3E635] accent-[#A3E635]"
                      />
                      <span className="text-sm font-medium text-white">
                        Evento de Entrada Gratuita
                      </span>
                    </label>
                    <ConfidenceBadge confidence={extractedFields?.is_free?.confidence} />
                  </div>

                  {!formData.is_free && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                          Preço Mínimo (€) *
                        </label>
                        <ConfidenceBadge confidence={extractedFields?.price_min?.confidence} />
                      </div>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="Ex: 15.00"
                        value={formData.price_min || 0}
                        onChange={(e) =>
                          setFormData({ ...formData, price_min: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                  )}

                  <Select
                    label="Disponibilidade dos Bilhetes"
                    options={[
                      { value: "AVAILABLE", label: "Bilhetes Disponíveis" },
                      { value: "SOON", label: "Em Breve / Brevemente" },
                      { value: "SOLD_OUT", label: "Esgotado" },
                    ]}
                    value={formData.ticket_status || "AVAILABLE"}
                    onChange={(e) =>
                      setFormData({ ...formData, ticket_status: e.target.value as TicketStatus })
                    }
                  />

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                        Link de Compra de Bilhetes
                      </label>
                      <ConfidenceBadge confidence={extractedFields?.ticket_url?.confidence} />
                    </div>
                    <Input
                      placeholder="Ex: https://shotgun.live/events/..."
                      value={formData.ticket_url || ""}
                      onChange={(e) => setFormData({ ...formData, ticket_url: e.target.value })}
                      leftIcon={<Ticket className="w-4 h-4" />}
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Media & Poster */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">
                      Poster Principal do Evento (Formato Vertical 9:16 ou 3:4) *
                    </label>
                    <ImageDropzone
                      value={formData.image}
                      onChange={(url) => setFormData({ ...formData, image: url })}
                    />
                  </div>

                  <Input
                    label="Ou inserir URL do Poster"
                    placeholder="https://..."
                    value={formData.image || ""}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>
              )}

              {/* STEP 5: Final Review */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-5 rounded-2xl bg-[#121824] border border-white/10 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Resumo do Evento a Publicar
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[#64748B] block">Nome</span>
                        <span className="font-semibold text-white">{formData.name || "Sem nome"}</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">Categorias</span>
                        <span className="font-semibold text-[#A3E635]">
                          {formData.categoria?.join(", ") || "Sem categoria"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">Data e Hora</span>
                        <span className="font-semibold text-white">
                          {formData.start_date ? new Date(formData.start_date).toLocaleString("pt-PT") : "Não definida"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">Recinto & Cidade</span>
                        <span className="font-semibold text-white">
                          {formData.venue_name || "Recinto não especificado"} ({formData.location})
                        </span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">Preço</span>
                        <span className="font-semibold text-white">
                          {formData.is_free ? "Entrada Livre" : `${formData.price_min} €`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">Organização</span>
                        <span className="font-semibold text-white">{activeOrg?.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#1E293B]/60 border border-white/10 text-xs text-[#94A3B8] space-y-2">
                    <p className="font-semibold text-white">Próximo Passo:</p>
                    <p>
                      Ao clicar em <strong>Publicar Evento</strong>, o evento será enviado para o catálogo público do Lotus, notificando automaticamente os seguidores da organização e os utilizadores da zona de {formData.location}.
                    </p>
                  </div>
                </div>
              )}

              {/* Step Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  disabled={currentStep === 1 || isSubmitting}
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                >
                  Anterior
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                  >
                    Guardar Rascunho
                  </Button>

                  {currentStep < steps.length ? (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
                    >
                      Próximo
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handlePublish}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "A Publicar..." : "Publicar Evento"}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Reference Poster (if extracted) OR Mobile Live Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            {importedPosterUrl && showPosterReference ? (
              <Card isGlass className="space-y-4 border border-[#A3E635]/30">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#A3E635]" />
                    <span className="text-xs font-bold text-white">Cartaz de Referência</span>
                  </div>
                  <span className="text-[10px] text-[#94A3B8]">Conferência Visual</span>
                </div>

                <div className="rounded-xl overflow-hidden border border-white/10 bg-black max-h-[420px] flex items-center justify-center">
                  <img
                    src={importedPosterUrl}
                    alt="Cartaz Importado"
                    className="w-full h-full object-contain max-h-[420px]"
                  />
                </div>

                <p className="text-[11px] text-[#64748B] text-center">
                  Usa este cartaz como referência visual enquanto confirmas os dados nos passos do formulário.
                </p>
              </Card>
            ) : (
              <LiveMobilePreview event={formData} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
