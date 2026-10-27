"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useOrgStore } from "@/stores/useOrgStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Building2, Globe, AtSign, Sparkles } from "lucide-react";

interface CreateOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateOrgModal: React.FC<CreateOrgModalProps> = ({ isOpen, onClose }) => {
  const { addOrganization } = useOrgStore();
  const { user } = useAuthStore();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [instagram, setInstagram] = React.useState("");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user?.uid) return;

    setIsLoading(true);
    setError(null);
    try {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      await addOrganization(
        {
          name,
          slug,
          description,
          city: "Lisboa",
          country: "Portugal",
          website,
          instagram,
          logo_url: logoUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&auto=format&fit=crop&q=80",
          categories: ["Música Eletrónica & Clubbing"],
          is_verified: false,
          followers_count: 0,
          public_profile_enabled: true,
          created_by: user.uid,
        },
        user.uid
      );

      onClose();
      setName("");
      setDescription("");
      setWebsite("");
      setInstagram("");
      setLogoUrl("");
    } catch {
      setError("Não foi possível criar a organização. Tenta novamente.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Nova Organização"
      description="Regista a tua produtora, coletivo, venue ou entidade promotora no ecossistema Lotus."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}
        <Input
          label="Nome da Organização *"
          placeholder="Ex: Primavera Sound, Lux Frágil, Coletivo Sonoro"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<Building2 className="w-4 h-4" />}
          required
        />

        <Textarea
          label="Descrição / Bio"
          placeholder="Apresenta a tua organização, estilo musical ou foco de eventos..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Website Oficial"
            placeholder="https://..."
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            leftIcon={<Globe className="w-4 h-4" />}
          />
          <Input
            label="Instagram"
            placeholder="@organizacao"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            leftIcon={<AtSign className="w-4 h-4" />}
          />
        </div>

        <Input
          label="URL do Logo"
          placeholder="https://... (URL da imagem)"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          helperText="Podes colar um link direto para o logo ou imagem da entidade."
        />

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            <Sparkles className="w-4 h-4" />
            <span>Criar Organização</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
