"use client";

import * as React from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/infrastructure/firebase/firebaseConfig";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, ArrowLeft, CheckCircle, Sparkles } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSubmitted(true);
    } catch {
      setError("Não foi possível enviar o email. Verifica se o endereço está correto.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Card isGlass className="p-8 border-white/10 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Recuperar Palavra-passe
        </h1>
        <p className="text-xs text-[#94A3B8]">
          Insere o email associado à tua conta de promoter para receberes um link de redefinição seguro.
        </p>
      </div>

      {isSubmitted ? (
        <div className="space-y-5 text-center animate-fade-in py-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(52,211,153,0.3)]">
            <CheckCircle className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">Email Enviado!</h3>
            <p className="text-xs text-[#94A3B8] max-w-xs mx-auto">
              Enviámos as instruções de recuperação para <strong className="text-white">{email}</strong>.
            </p>
          </div>

          <Link href="/login" className="block pt-2">
            <Button variant="primary" size="md" className="w-full justify-center">
              Voltar ao Login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <Input
            label="Email da Conta *"
            type="email"
            placeholder="promoter@organizacao.pt"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center"
            isLoading={isLoading}
          >
            <Sparkles className="w-4 h-4 mr-1" />
            <span>Enviar Link de Recuperação</span>
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Login</span>
            </Link>
          </div>
        </form>
      )}
    </Card>
  );
}
