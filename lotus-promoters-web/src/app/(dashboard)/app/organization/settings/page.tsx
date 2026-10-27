"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { ImageDropzone } from "@/components/forms/ImageDropzone";
import { PublicPromoterProfilePreview } from "@/components/preview/PublicPromoterProfilePreview";
import { useOrgStore } from "@/stores/useOrgStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { PROMOTER_CATEGORIES, Organization } from "@/core/domain/organization";
import {
  Building2,
  Globe,
  AtSign,
  ShieldCheck,
  CheckCircle,
  Save,
  Sparkles,
  Music2,
  Share2,
  MapPin,
  ExternalLink,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OrganizationSettingsPage() {
  const { getActiveOrg, updateOrganization } = useOrgStore();
  const { user } = useAuthStore();
  const activeOrg = getActiveOrg();

  const [formData, setFormData] = React.useState<Partial<Organization>>(() => ({
    name: activeOrg?.name || "",
    slug: activeOrg?.slug || "",
    description: activeOrg?.description || "",
    city: activeOrg?.city || "Lisboa",
    country: activeOrg?.country || "Portugal",
    logo_url: activeOrg?.logo_url || "",
    banner_url: activeOrg?.banner_url || "",
    website: activeOrg?.website || "",
    instagram: activeOrg?.instagram || "",
    tiktok: activeOrg?.tiktok || "",
    twitter_x: activeOrg?.twitter_x || "",
    spotify: activeOrg?.spotify || "",
    youtube: activeOrg?.youtube || "",
    categories: activeOrg?.categories || ["Música Eletrónica & Clubbing"],
    is_verified: activeOrg?.is_verified ?? false,
    followers_count: activeOrg?.followers_count || 0,
    public_profile_enabled: activeOrg?.public_profile_enabled ?? true,
  }));

  const [isSaving, setIsSaving] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);


  const handleCategoryToggle = (category: string) => {
    const current = formData.categories || [];
    if (current.includes(category)) {
      setFormData({ ...formData, categories: current.filter((c) => c !== category) });
    } else {
      setFormData({ ...formData, categories: [...current, category] });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    setIsSaving(true);
    try {
      if (activeOrg?.id) {
        await updateOrganization(activeOrg.id, formData);
      }
      setToastMessage("Perfil público da organização atualizado com sucesso!");
      setTimeout(() => setToastMessage(null), 3500);
    } catch {
      setToastMessage("Erro ao guardar. Tenta novamente.");
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161F30] border border-[#A3E635]/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up">
          <CheckCircle className="w-5 h-5 text-[#A3E635]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Perfil Público & Definições"
        subtitle="Configura a identidade pública da tua organização no Lotus Mobile para os utilizadores e seguidores."
        badge={
          formData.is_verified ? (
            <Badge variant="lime">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verificado</span>
            </Badge>
          ) : (
            <Badge variant="default">Não verificado</Badge>
          )
        }
        actions={
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSave}
            isLoading={isSaving}
          >
            <Save className="w-4 h-4 mr-1" />
            <span>Guardar Alterações</span>
          </Button>
        }
      />

      {/* Main Grid: Left Editor (7 Cols) / Right Live Public Simulator (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Editor */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          {/* Section 1: Basic & Identity */}
          <Card isGlass className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#A3E635]" />
                <span>Identidade Principal</span>
              </h3>
              <span className="text-[11px] text-[#64748B]">
                ID: <code className="text-[#94A3B8]">{activeOrg?.id}</code>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nome Oficial da Entidade *"
                placeholder="Ex: Sublime Productions"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label="Slug Público (Link Único) *"
                placeholder="ex: sublime-productions"
                value={formData.slug || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  })
                }
                helperText={`https://lotus.events/@${formData.slug || "slug"}`}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Cidade Base *"
                placeholder="Ex: Lisboa, Porto, Braga..."
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                leftIcon={<MapPin className="w-4 h-4" />}
                required
              />

              <Input
                label="País"
                value={formData.country || "Portugal"}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>

            <Textarea
              label="Bio & Descrição Pública *"
              placeholder="Apresenta a história da produtora, linha artística e proposta cultural..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              helperText="Visível diretamente na página da organização na aplicação móvel."
            />
          </Card>

          {/* Section 2: Visual Branding (Logo & Banner) */}
          <Card isGlass className="space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
              <Sparkles className="w-4 h-4 text-[#A3E635]" />
              <span>Imagens de Marca (Logo & Capa)</span>
            </h3>

            {/* Banner Dropzone */}
            <ImageDropzone
              value={formData.banner_url || ""}
              onChange={(url) => setFormData({ ...formData, banner_url: url })}
              label="Banner de Capa (Header 16:9)"
              helperText="Recomendado: 1920x600px. Aparece no topo do perfil público."
            />

            {/* Logo Dropzone */}
            <div className="pt-2">
              <Input
                label="URL do Logótipo Oficial (Avatar 1:1)"
                placeholder="https://..."
                value={formData.logo_url || ""}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                helperText="Logótipo circular exibido no feed e no cabeçalho do perfil."
              />
            </div>
          </Card>

          {/* Section 3: Categories & Musical Styles */}
          <Card isGlass className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
              <Music2 className="w-4 h-4 text-[#A3E635]" />
              <span>Categorias & Estilos Principais</span>
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Seleciona as áreas em que a tua organização atua para melhorar as recomendações no Lotus Mobile:
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {PROMOTER_CATEGORIES.map((cat) => {
                const isSelected = formData.categories?.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryToggle(cat)}
                    className={cn(
                      "px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-150 text-left",
                      isSelected
                        ? "bg-[#A3E635]/20 text-[#A3E635] border-[#A3E635]/50 shadow-[0_0_12px_rgba(163,230,53,0.25)] font-semibold"
                        : "bg-[#121824] text-[#94A3B8] border-white/10 hover:border-white/20 hover:text-white"
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Section 4: Social Links & Digital Presence */}
          <Card isGlass className="space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
              <Share2 className="w-4 h-4 text-[#A3E635]" />
              <span>Presença Digital & Redes Sociais</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Instagram Oficial"
                placeholder="@sublime.events"
                value={formData.instagram || ""}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                leftIcon={<AtSign className="w-4 h-4" />}
              />

              <Input
                label="TikTok"
                placeholder="@sublime.fest"
                value={formData.tiktok || ""}
                onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                leftIcon={<AtSign className="w-4 h-4" />}
              />

              <Input
                label="Website Oficial"
                placeholder="https://..."
                value={formData.website || ""}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                leftIcon={<Globe className="w-4 h-4" />}
              />

              <Input
                label="Perfil Spotify / Curadoria"
                placeholder="https://open.spotify.com/..."
                value={formData.spotify || ""}
                onChange={(e) => setFormData({ ...formData, spotify: e.target.value })}
                leftIcon={<Music2 className="w-4 h-4" />}
              />
            </div>
          </Card>

          {/* Section 5: Visibility Toggle */}
          <Card isGlass className="p-4 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-white block">
                Perfil Público Visível na Aplicação
              </span>
              <span className="text-xs text-[#94A3B8]">
                Permite aos utilizadores do Lotus Mobile encontrar a organização e seguir os teus eventos.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.public_profile_enabled ?? true}
                onChange={(e) =>
                  setFormData({ ...formData, public_profile_enabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#1E293B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A3E635]" />
            </label>
          </Card>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              isLoading={isSaving}
            >
              <Save className="w-4 h-4 mr-1" />
              <span>Guardar Perfil Público</span>
            </Button>
          </div>
        </form>

        {/* Right Column: Public Profile Live Simulator */}
        <div className="lg:col-span-5 hidden lg:block">
          <PublicPromoterProfilePreview organization={formData} />
        </div>
      </div>
    </div>
  );
}
