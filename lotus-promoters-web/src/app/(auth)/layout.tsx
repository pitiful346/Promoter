import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0B0E14] flex flex-col justify-between relative overflow-hidden text-[#F8FAFC]">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#A3E635]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#161F30]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="p-6 md:p-8 flex items-center justify-between relative z-10">
        <Link href="/login" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A3E635] to-[#4D7C0F] p-[1.5px] shadow-[0_0_20px_-3px_rgba(163,230,53,0.4)]">
            <div className="w-full h-full bg-[#0B0E14] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#A3E635]" />
            </div>
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white block">
              LOTUS
            </span>
            <span className="text-[10px] tracking-widest font-semibold uppercase text-[#A3E635] -mt-1 block">
              PROMOTERS
            </span>
          </div>
        </Link>

        <div className="text-xs text-[#94A3B8] hidden sm:block">
          Plataforma Profissional B2B
        </div>
      </header>

      {/* Main Form Center Box */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-6 relative z-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-[#64748B] relative z-10">
        <p>© 2026 Lotus Discovery Platform • Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
