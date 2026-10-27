"use client";

import * as React from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/infrastructure/firebase/firebaseConfig";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  className?: string;
  storagePath?: string; // e.g. "events/org_abc" or "organizations/org_abc"
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  value,
  onChange,
  label = "Poster Principal do Evento",
  helperText = "PNG, JPG ou WebP até 10MB. Proporção recomendada: 16:9 ou 4:5.",
  className,
  storagePath = "uploads/events",
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const sampleImages = [
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=80",
  ];

  const handleFile = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const safeFilename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const storageRef = ref(storage, `${storagePath}/${safeFilename}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      onChange(downloadUrl);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch {
      setUploadError("Erro ao fazer upload. Tenta novamente.");
    } finally {
      setIsUploading(false);
    }
  };


  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={cn("space-y-2 text-left", className)}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-red-400 hover:underline flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Remover Imagem</span>
          </button>
        )}
      </div>

      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-white/15 group aspect-[16/9] bg-[#121824]">
          <img
            src={value}
            alt="Poster do evento"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-[#A3E635] text-black font-semibold text-xs shadow-lg hover:bg-[#BEF264]"
            >
              Alterar Imagem
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer",
            isDragging
              ? "border-[#A3E635] bg-[#A3E635]/10"
              : "border-white/15 hover:border-white/30 bg-[#121824]/60 hover:bg-[#161F30]"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-12 h-12 rounded-2xl bg-[#1E293B] text-[#64748B] flex items-center justify-center mx-auto mb-3">
            {isUploading ? (
              <span className="w-6 h-6 border-2 border-[#A3E635] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-[#A3E635]" />
            )}
          </div>

          <h4 className="text-sm font-semibold text-white">
            {isUploading ? "A processar imagem..." : "Arrasta uma imagem ou clica para escolher"}
          </h4>
          <p className="text-xs text-[#94A3B8] mt-1">{helperText}</p>
          {uploadError && (
            <p className="text-xs text-red-400 font-medium mt-2">{uploadError}</p>
          )}
          {uploadSuccess && (
            <p className="text-xs text-[#A3E635] font-medium mt-2">Imagem carregada com sucesso!</p>
          )}

          {/* Quick preset selector for instant testing */}
          <div className="mt-4 pt-4 border-t border-white/[0.08]" onClick={(e) => e.stopPropagation()}>
            <span className="text-[11px] text-[#64748B] block mb-2">
              Ou escolhe uma imagem de demonstração:
            </span>
            <div className="flex items-center justify-center gap-2">
              {sampleImages.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange(sample)}
                  className="w-10 h-10 rounded-lg overflow-hidden border border-white/20 hover:border-[#A3E635] transition-all hover:scale-105"
                >
                  <img src={sample} alt="Sample" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
