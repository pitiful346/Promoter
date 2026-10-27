"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/useAuthStore";
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Preenche todos os campos.");
      return;
    }

    try {
      const ok = await login(email, password);
      if (ok) {
        router.push("/app/dashboard");
      }
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      if (fbErr?.code === "auth/invalid-credential" || fbErr?.code === "auth/user-not-found" || fbErr?.code === "auth/wrong-password") {
        setError("Credenciais inválidas. Verifique o email e a palavra-passe.");
      } else if (fbErr?.code === "auth/too-many-requests") {
        setError("Muitas tentativas falhadas. Tente novamente mais tarde.");
      } else {
        setError(fbErr?.message || "Ocorreu um erro ao tentar entrar. Tente novamente.");
      }
    }
  };

  const handleDemoFill = () => {
    setEmail("pedro@lotus.pt");
    setPassword("LotusDemo2026!");
    setError(null);
  };


  return (
    <Card isGlass className="p-8 border-white/10 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Entrar no Lotus Promoters
        </h1>
        <p className="text-xs text-[#94A3B8]">
          Gere os teus eventos, venues, bilheteiras e métricas no mesmo backend da app Lotus.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Profissional *"
          type="email"
          placeholder="promoter@organizacao.pt"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <div className="space-y-1.5">
          <Input
            label="Palavra-passe *"
            type={showPassword ? "text" : "password"}
            placeholder="A tua palavra-passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#64748B] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            required
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-[#94A3B8] cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-[#A3E635] accent-[#A3E635]"
            />
            <span>Lembrar-me</span>
          </label>

          <Link
            href="/forgot-password"
            className="text-[#A3E635] hover:underline font-medium"
          >
            Recuperar palavra-passe
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full justify-center"
          isLoading={isLoading}
        >
          <span>Iniciar Sessão</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      {/* Demo helper badge button */}
      <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
        <button
          type="button"
          onClick={handleDemoFill}
          className="text-[11px] text-[#94A3B8] hover:text-[#A3E635] flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3 h-3 text-[#A3E635]" />
          <span>Preencher credenciais de teste</span>
        </button>

        <span className="text-[10px] text-[#64748B] flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          Acesso Seguro
        </span>
      </div>

      <div className="text-center text-xs text-[#94A3B8]">
        Ainda não és promoter registado?{" "}
        <Link href="/register" className="text-[#A3E635] font-semibold hover:underline">
          Criar Conta
        </Link>
      </div>
    </Card>
  );
}
