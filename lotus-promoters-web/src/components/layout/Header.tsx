"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus, Bell, Search } from "lucide-react";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  return (
    <header className="h-16 border-b border-white/10 bg-[#0B0E14]/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Quick Search */}
      <div className="relative w-72 md:w-96">
        <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Pesquisar eventos, locais, artistas..."
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full bg-[#121824] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]/40 transition-colors"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <Link href="/app/notifications" title="Notificações de Sistema">
          <button className="p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 border border-white/5 transition-colors relative cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#A3E635] absolute top-1.5 right-1.5 shadow-[0_0_8px_#A3E635]" />
          </button>
        </Link>

        <Link href="/app/events/new">
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Criar Evento</span>
          </Button>
        </Link>
      </div>
    </header>
  );
};
