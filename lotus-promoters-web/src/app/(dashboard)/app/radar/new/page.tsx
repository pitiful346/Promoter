"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ImageDropzone } from "@/components/forms/ImageDropzone";
import { LiveRadarTeaserPreview } from "@/components/preview/LiveRadarTeaserPreview";
import { useOrgStore } from "@/stores/useOrgStore";
import { useTeaserStore } from "@/stores/useTeaserStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { PROMOTER_CATEGORIES } from "@/core/domain/organization";
import { LotusTeaser } from "@/core/domain/teaser";
import {
  Radio,
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  Save,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export default function NewTeaserPage() {
  const router = useRouter();
  const { getActiveOrg } = useOrgStore();
  const { user } = useAuthStore();
  const activeOrg = getActiveOrg();
  const { addTeaser } = useTeaserStore();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<Partial<LotusTeaser>>({
    codename: "SECRET_PROJECT_2026",
    title: "SOMETHING IS COMING",
    description: "Um conceito sonoro exclusivo em espaço industrial nunca antes explorado. Capacidade limitada.",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    city: "Porto",
    category: "Música Eletrónica & Clubbing",
    approximate_date: "Outubro 2026",
    reveal_at: "2026-10-15T18:00",
    status: "PUBLISHED",
  });

  const handleSubmit = async (status: "DRAFT" | "PUBLISHED") => {
    if (!formData.codename?.trim() || !formData.description?.trim() || !activeOrg?.id || !user?.uid) return;

    setIsSubmitting(true);
    try {
      await addTeaser({
        organization_id: activeOrg.id,
        codename: formData.codename!,
        title: formData.title || undefined,
        description: formData.description!,
        image: formData.image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
        city: formData.city || "Lisboa",
        category: formData.category || "Música Eletrónica & Clubbing",
        approximate_date: formData.approximate_date || undefined,
        reveal_at: formData.reveal_at ? new Date(formData.reveal_at).toISOString() : new Date(Date.now() + 86400000 * 30).toISOString(),
        status,
        created_by: user.uid,
      });

      router.push("/app/radar");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Back button */}
      <div>
        <Link
          href="/app/radar"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#A3E635] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Lotus Radar</span>
        </Link>
      </div>

      {/* Page Header */}
      <PageHeader
        title="Criar Teaser Oficial"
        subtitle="Publica uma antecipação no Lotus Radar para que a tua comunidade ative notificações e acompanhe o countdown até ao reveal."
        actions={
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => handleSubmit("DRAFT")}
              isLoading={isSubmitting}
            >
              <Save className="w-4 h-4 mr-1" />
              <span>Guardar Rascunho</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => handleSubmit("PUBLISHED")}
              isLoading={isSubmitting}
            >
              <Radio className="w-4 h-4 mr-1 animate-pulse" />
              <span>Publicar no Radar</span>
            </Button>
          </div>
        }
      />

      {/* Main Grid: Form Editor (7 cols) / Live Radar Simulator (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Teaser Identity */}
          <Card isGlass className="space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
              <Radio className="w-4 h-4 text-[#A3E635]" />
              <span>Identidade do Teaser</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Codename Interno *"
                placeholder="Ex: PROJECT_TITAN_2026"
                value={formData.codename || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    codename: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                  })
                }
                helperText="Identificador de projeto único"
                required
              />

              <Input
                label="Título Público do Teaser (Opcional)"
                placeholder="Ex: SOMETHING IS COMING"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                helperText="Título impactante visível no feed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Cidade / Região Prevista *"
                placeholder="Ex: Porto, Lisboa, Braga..."
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                leftIcon={<MapPin className="w-4 h-4" />}
                required
              />

              <Input
                label="Data ou Época Aproximada"
                placeholder="Ex: Outubro 2026, Verão 2027..."
                value={formData.approximate_date || ""}
                onChange={(e) => setFormData({ ...formData, approximate_date: e.target.value })}
                leftIcon={<Calendar className="w-4 h-4" />}
                helperText="Pista temporal para o público"
              />
            </div>

            <Select
              label="Categoria Cultural / Musical *"
              options={PROMOTER_CATEGORIES.map((c) => ({ value: c, label: c }))}
              value={formData.category || PROMOTER_CATEGORIES[0]}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </Card>

          {/* Section 2: Artwork & Copy */}
          <Card isGlass className="space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
              <Sparkles className="w-4 h-4 text-[#A3E635]" />
              <span>Arte & Pista Teaser</span>
            </h3>

            <ImageDropzone
              value={formData.image || ""}
              onChange={(url) => setFormData({ ...formData, image: url })}
              label="Poster ou Imagem de Antecipação *"
              helperText="Imagem misteriosa ou conceito gráfico oficial (proporção 4:5 ou 16:9)."
            />

            <Textarea
              label="Texto / Pista Teaser *"
              placeholder="Descreve o enigma, atmosfera ou antecipação para aguçar a curiosidade dos utilizadores..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </Card>

          {/* Section 3: Official Reveal Date */}
          <Card isGlass className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
              <Clock className="w-4 h-4 text-[#A3E635]" />
              <span>Data & Hora do Reveal Oficial</span>
            </h3>

            <p className="text-xs text-[#94A3B8]">
              Define o momento exato em que a contagem decrescente termina e os utilizadores que estão a acompanhar recebem notificação:
            </p>

            <Input
              type="datetime-local"
              label="Momento do Reveal *"
              value={formData.reveal_at || ""}
              onChange={(e) => setFormData({ ...formData, reveal_at: e.target.value })}
              required
            />

            <div className="p-3.5 rounded-xl bg-[#121824] border border-[#A3E635]/20 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-[#A3E635] shrink-0" />
              <span className="text-xs text-[#CBD5E1]">
                No momento do reveal, o teaser pode ser convertido automaticamente no evento completo com bilheteira.
              </span>
            </div>
          </Card>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => handleSubmit("DRAFT")}
              isLoading={isSubmitting}
            >
              Guardar Rascunho
            </Button>

            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => handleSubmit("PUBLISHED")}
              isLoading={isSubmitting}
            >
              <Radio className="w-4 h-4 mr-1 animate-pulse" />
              <span>Publicar no Lotus Radar</span>
            </Button>
          </div>
        </div>

        {/* Right Preview Simulator */}
        <div className="lg:col-span-5 hidden lg:block">
          <LiveRadarTeaserPreview teaser={formData} />
        </div>
      </div>
    </div>
  );
}
