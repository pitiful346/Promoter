"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/useAuthStore";
import { User, Mail, Lock, Sparkles, ArrowRight, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [acceptTerms, setAcceptTerms] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName || !email || !password) {
      setError("Preenche todos os campos obrigatórios.");
      return;
    }

    if (password.length < 8) {
      setError("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As palavras-passe não coincidem.");
      return;
    }

    if (!acceptTerms) {
      setError("Deves aceitar os termos de serviço e privacidade.");
      return;
    }

    try {
      const ok = await register(displayName, email, password);
      if (ok) {
        router.push("/onboarding");
      }
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      if (fbErr?.code === "auth/email-already-in-use") {
        setError("Este email já se encontra registado. Tente fazer login.");
      } else if (fbErr?.code === "auth/weak-password") {
        setError("A palavra-passe é demasiado fraca. Use pelo menos 6 caracteres.");
      } else if (fbErr?.code === "auth/invalid-email") {
        setError("O formato do email introduzido é inválido.");
      } else {
        setError(fbErr?.message || "Ocorreu um erro ao criar a conta. Tente novamente.");
      }
    }
  };


  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();

  return (
    <Card isGlass className="p-8 border-white/10 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Registo de Promoter
        </h1>
        <p className="text-xs text-[#94A3B8]">
          Junta-te ao Lotus e começa a publicar os teus eventos para milhares de pessoas.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome Completo *"
          placeholder="Ex: Pedro Marques"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
          required
        />

        <Input
          label="Email Profissional *"
          type="email"
          placeholder="contacto@tuaempresa.pt"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <div className="space-y-1.5">
          <Input
            label="Palavra-passe (mínimo 8 caracteres) *"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          {password && (
            <div className="flex items-center gap-1.5 pt-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    strength >= level
                      ? strength > 2
                        ? "bg-[#A3E635]"
                        : "bg-amber-400"
                      : "bg-[#1E293B]"
                  }`}
                />
              ))}
              <span className="text-[10px] text-[#94A3B8] ml-1">
                {strength <= 1 ? "Fraca" : strength <= 3 ? "Média" : "Forte"}
              </span>
            </div>
          )}
        </div>

        <Input
          label="Confirmar Palavra-passe *"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <div className="pt-1">
          <label className="flex items-start gap-2.5 text-xs text-[#94A3B8] cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-[#A3E635] accent-[#A3E635]"
            />
            <span>
              Concordo com os Termos de Utilização de Promoters e a Política de Privacidade do Lotus.
            </span>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full justify-center mt-2"
          isLoading={isLoading}
        >
          <Sparkles className="w-4 h-4 mr-1" />
          <span>Criar Conta & Configurar Entidade</span>
        </Button>
      </form>

      <div className="text-center text-xs text-[#94A3B8] pt-2 border-t border-white/[0.08]">
        Já tens conta de promoter?{" "}
        <Link href="/login" className="text-[#A3E635] font-semibold hover:underline">
          Iniciar Sessão
        </Link>
      </div>
    </Card>
  );
}
