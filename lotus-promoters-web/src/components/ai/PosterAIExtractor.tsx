"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PosterExtractionResult } from "@/core/domain/ai";
import { Venue } from "@/core/domain/venue";
import { firebaseStorageService } from "@/infrastructure/firebase/FirebaseStorageService";
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  Ticket,
  Users,
  X,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PosterAIExtractorProps {
  venues: Venue[];
  onExtracted: (result: PosterExtractionResult, imageUrl: string) => void;
  onCancel: () => void;
  className?: string;
}

export const PosterAIExtractor: React.FC<PosterAIExtractorProps> = ({
  venues,
  onExtracted,
  onCancel,
  className,
}) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysisStep, setAnalysisStep] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const [extractionResult, setExtractionResult] = React.useState<PosterExtractionResult | null>(null);
  const [uploadedStorageUrl, setUploadedStorageUrl] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setExtractionResult(null);

    // Validate MIME
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(selectedFile.type)) {
      setError("Formato de imagem não suportado. Usa JPG, PNG ou WebP.");
      return;
    }

    // Validate Size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("O ficheiro é demasiado grande. Tamanho máximo: 10MB.");
      return;
    }

    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Step 1: Upload to Firebase Storage
      setAnalysisStep("A guardar imagem do cartaz...");
      let finalImageUrl = previewUrl || "";
      try {
        finalImageUrl = await firebaseStorageService.uploadEventPoster(`ai_draft_${Date.now()}`, file);
        setUploadedStorageUrl(finalImageUrl);
      } catch (storageErr) {
        console.warn("Storage upload warning, using local preview for AI:", storageErr);
      }

      // Step 2: Convert to Base64 for Server-Side AI
      setAnalysisStep("A ler texto, layout e tipografia com IA...");
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      // Step 3: Call Server-Side AI Extraction Endpoint
      setAnalysisStep("A identificar artistas, horários e recinto...");
      const response = await fetch("/api/ai/extract-poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type,
          venues,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro na análise do cartaz (${response.status})`);
      }

      setAnalysisStep("A normalizar dados e validar recinto...");
      const result: PosterExtractionResult = await response.json();

      if (!result.success) {
        throw new Error(result.error || "A IA não conseguiu interpretar os dados deste cartaz.");
      }

      setExtractionResult(result);
      setIsAnalyzing(false);
    } catch (err: unknown) {
      setIsAnalyzing(false);
      setError(err instanceof Error ? err.message : "Erro ao analisar o cartaz.");
    }
  };

  const handleApplyToForm = () => {
    if (extractionResult) {
      onExtracted(extractionResult, uploadedStorageUrl || previewUrl || "");
    }
  };

  return (
    <Card isGlass className={cn("space-y-6 border border-[#A3E635]/30 relative overflow-hidden", className)}>
      {/* Glow effect */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#A3E635]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A3E635]/20 border border-[#A3E635]/40 flex items-center justify-center text-[#A3E635] shadow-[0_0_15px_rgba(163,230,53,0.3)]">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Importar Cartaz com IA</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30">
                Gemini Vision
              </span>
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Faz upload do cartaz oficial para preencher automaticamente os campos do evento.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-[#64748B] hover:text-white transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Dropzone & Preview */}
      {!extractionResult && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !isAnalyzing && fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[220px]",
              previewUrl
                ? "border-[#A3E635]/50 bg-[#121824]/80"
                : "border-white/10 hover:border-[#A3E635]/40 bg-[#0B0E14]/60 hover:bg-[#121824]/40"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              disabled={isAnalyzing}
            />

            {previewUrl ? (
              <div className="flex flex-col md:flex-row items-center gap-6 w-full">
                <div className="w-32 h-44 rounded-xl overflow-hidden border border-white/20 shadow-xl shrink-0 bg-black">
                  <img
                    src={previewUrl}
                    alt="Poster Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left space-y-2 flex-1">
                  <span className="text-xs font-semibold text-[#A3E635] flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Cartaz selecionado
                  </span>
                  <p className="text-sm font-bold text-white truncate max-w-sm">{file?.name}</p>
                  <p className="text-xs text-[#94A3B8]">
                    {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : ""} • JPG / PNG / WebP
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    Clica para trocar de imagem ou clica no botão abaixo para analisar.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#161F30] border border-white/10 flex items-center justify-center mx-auto text-[#A3E635]">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Arrasta o cartaz para aqui ou clica para procurar
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">
                    Suporta imagens de alta resolução (JPG, PNG, WebP até 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Não foi possível processar o cartaz</p>
                <p className="text-rose-400/80 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isAnalyzing}
            >
              Preencher Manualmente
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleAnalyze}
              disabled={!file || isAnalyzing}
              className="min-w-[200px]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-black" />
                  <span>{analysisStep || "A analisar..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span>Analisar Cartaz com IA</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Success Summary View */}
      {extractionResult && (
        <div className="space-y-5 animate-fade-in">
          <div className="p-4 rounded-xl bg-[#121824] border border-[#A3E635]/40 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#A3E635]">
              <CheckCircle className="w-4 h-4" />
              <span>Análise Concluída com Sucesso</span>
            </div>
            <p className="text-sm font-semibold text-white">
              {extractionResult.summary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0B0E14]/80 border border-white/5 space-y-1">
                <span className="text-[#64748B] text-[10px] block uppercase font-bold">Título</span>
                <span className="font-semibold text-white block truncate">
                  {extractionResult.normalized_event.name || "Não identificado"}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0B0E14]/80 border border-white/5 space-y-1">
                <span className="text-[#64748B] text-[10px] block uppercase font-bold">Data</span>
                <span className="font-semibold text-white block truncate">
                  {extractionResult.extracted_fields.start_date.value ? new Date(extractionResult.extracted_fields.start_date.value).toLocaleDateString("pt-PT") : "Não identificada"}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0B0E14]/80 border border-white/5 space-y-1">
                <span className="text-[#64748B] text-[10px] block uppercase font-bold">Recinto</span>
                <span className="font-semibold text-[#A3E635] block truncate">
                  {extractionResult.venue_match?.venue_name || extractionResult.normalized_event.venue_name || "A confirmar"}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0B0E14]/80 border border-white/5 space-y-1">
                <span className="text-[#64748B] text-[10px] block uppercase font-bold">Preço</span>
                <span className="font-semibold text-white block truncate">
                  {extractionResult.normalized_event.is_free ? "Entrada Livre" : `${extractionResult.normalized_event.price_min}€`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setExtractionResult(null);
                setFile(null);
                setPreviewUrl(null);
              }}
            >
              Analisar Outro Cartaz
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleApplyToForm}
              className="gap-2"
            >
              <span>Aplicar e Rever Formulário</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
