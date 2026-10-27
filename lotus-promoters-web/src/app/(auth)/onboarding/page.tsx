"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useOrgStore } from "@/stores/useOrgStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Building2, Globe, AtSign, Sparkles, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const { addOrganization } = useOrgStore();
  const { completeOnboarding, user } = useAuthStore();

  const [step, setStep] = React.useState(1);
  const [orgName, setOrgName] = React.useState("");
  const [orgType, setOrgType] = React.useState("PRODUCER");
  const [city, setCity] = React.useState("Lisboa");
  const [description, setDescription] = React.useState("");
  const [instagram, setInstagram] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const orgTypeOptions = [
    { value: "PRODUCER", label: "Produtora de Eventos / Festivais" },
    { value: "VENUE", label: "Recinto / Clube / Espaço Cultural" },
    { value: "COLLECTIVE", label: "Coletivo Artístico / DJ Crew" },
    { value: "AGENCY", label: "Agência de Booking / Management" },
    { value: "OTHER", label: "Outra Entidade Promotora" },
  ];

  const handleFinish = async () => {
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      const slug = (orgName || "nova-organizacao")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      await addOrganization(
        {
          name: orgName || "A Minha Produtora",
          slug,
          description: description || "Entidade promotora no Lotus.",
          city: city || "Lisboa",
          country: "Portugal",
          website,
          instagram,
          logo_url:
            logoUrl ||
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&auto=format&fit=crop&q=80",
          categories: ["Música Eletrónica & Clubbing"],
          is_verified: false,
          followers_count: 0,
          public_profile_enabled: true,
          created_by: user.uid,
        },
        user.uid
      );
      completeOnboarding();
      router.push("/app/dashboard");
    } catch {
      // stay on page if creation fails
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card isGlass className="p-8 border-white/10 shadow-2xl space-y-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-[11px] font-bold tracking-wider uppercase text-[#A3E635] bg-[#A3E635]/15 px-2.5 py-1 rounded-full border border-[#A3E635]/30">
          Passo {step} de 3 • Configuração Inicial
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {step === 1 && "Regista a tua Organização"}
          {step === 2 && "Localização & Foco"}
          {step === 3 && "Presença Digital & Logótipo"}
        </h1>
        <p className="text-xs text-[#94A3B8]">
          {step === 1 && "Como se chama a produtora, venue ou coletivo que irá publicar os eventos?"}
          {step === 2 && "Onde realizas os eventos e qual é a proposta cultural da tua entidade?"}
          {step === 3 && "Adiciona as tuas redes para que os fãs do Lotus descubram a tua marca."}
        </p>
      </div>

      {/* Progress Bars */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              s <= step ? "bg-[#A3E635]" : "bg-[#1E293B]"
            )}
          />
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <Input
            label="Nome da Produtora / Entidade *"
            placeholder="Ex: Soundscape Events, Club Lux, Coletivo 00"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            leftIcon={<Building2 className="w-4 h-4" />}
            required
          />

          <Select
            label="Tipo de Entidade"
            options={orgTypeOptions}
            value={orgType}
            onChange={(e) => setOrgType(e.target.value)}
          />
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <Input
            label="Cidade Base Principal *"
            placeholder="Ex: Lisboa, Porto, Coimbra, Faro..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />

          <Textarea
            label="Descrição / Bio Resumida"
            placeholder="Ex: Promotora especializada em noites de techno, concertos indie e festivais boutique em Portugal..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <Input
            label="Instagram Oficial"
            placeholder="@tuaorganizacao"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            leftIcon={<AtSign className="w-4 h-4" />}
          />

          <Input
            label="Website (opcional)"
            placeholder="https://..."
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            leftIcon={<Globe className="w-4 h-4" />}
          />

          <Input
            label="URL da Imagem de Logótipo"
            placeholder="https://..."
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            helperText="Podes colar um link para a foto de perfil da organização."
          />
        </div>
      )}

      {/* Navigation buttons */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between">
        {step > 1 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setStep(step - 1)}
          >
            Anterior
          </Button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => {
              if (step === 1 && !orgName.trim()) return;
              setStep(step + 1);
            }}
          >
            <span>Seguinte</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleFinish}
            isLoading={isLoading}
          >
            <Sparkles className="w-4 h-4 mr-1" />
            <span>Concluir & Entrar no Painel</span>
          </Button>
        )}
      </div>
    </Card>
  );
}
