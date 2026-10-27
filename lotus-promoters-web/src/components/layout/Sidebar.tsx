"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  MapPin,
  BarChart3,
  Users,
  Settings,
  Sparkles,
  Radio,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { OrgSwitcher } from "./OrgSwitcher";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onNewOrgClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewOrgClick }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const navItems = [
    { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
    { label: "Eventos", href: "/app/events", icon: CalendarDays },
    { label: "Lotus Radar", href: "/app/radar", icon: Radio },
    { label: "Locais & Venues", href: "/app/venues", icon: MapPin },
    { label: "Métricas", href: "/app/analytics", icon: BarChart3 },
    { label: "Equipa & Membros", href: "/app/organization/members", icon: Users },
    { label: "Perfil & Definições", href: "/app/organization/settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "h-screen bg-[#0B0E14] border-r border-white/10 flex flex-col justify-between transition-all duration-300 relative z-30",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Top Header & Brand */}
      <div className="p-4 space-y-4">
        {/* Lotus Brand Logo */}
        <div className="flex items-center justify-between">
          <Link href="/app/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A3E635] to-[#4D7C0F] p-[1.5px] shadow-[0_0_20px_-3px_rgba(163,230,53,0.4)]">
              <div className="w-full h-full bg-[#0B0E14] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#A3E635]" />
              </div>
            </div>
            {!isCollapsed && (
              <div>
                <span className="text-base font-bold tracking-tight text-white block">
                  LOTUS
                </span>
                <span className="text-[10px] tracking-widest font-semibold uppercase text-[#A3E635] -mt-1 block">
                  PROMOTERS
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-white/5 transition-colors hidden md:block"
            title={isCollapsed ? "Expandir" : "Recolher"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Organization Switcher */}
        {!isCollapsed ? (
          <OrgSwitcher onNewOrgClick={onNewOrgClick} />
        ) : (
          <div className="w-10 h-10 mx-auto rounded-xl bg-[#161F30] border border-white/10 flex items-center justify-center cursor-pointer hover:border-[#A3E635]">
            <BuildingIcon />
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                  isActive
                    ? "bg-[#161F30] text-[#A3E635] shadow-[0_0_20px_-5px_rgba(163,230,53,0.25)] border border-[#A3E635]/30 font-semibold"
                    : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#A3E635] rounded-r-full shadow-[0_0_10px_#A3E635]" />
                )}
                <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-[#A3E635]" : "text-[#64748B] group-hover:text-[#94A3B8]")} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile & App link */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {!isCollapsed && (
          <div className="p-3 rounded-xl bg-[#121824] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
              <Sparkles className="w-3.5 h-3.5 text-[#A3E635]" />
              <span>Lotus Radar Beta</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#A3E635]/20 text-[#A3E635]">
              EM BREVE
            </span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-[#A3E635] p-[1.5px] shrink-0">
            <div className="w-full h-full rounded-full bg-[#0B0E14] flex items-center justify-center font-bold text-xs text-[#A3E635]">
              PM
            </div>
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <span className="text-xs font-semibold text-[#F8FAFC] block truncate">
                Pedro Marques
              </span>
              <span className="text-[11px] text-[#64748B] block truncate">
                Owner • promoter
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

function BuildingIcon() {
  return <div className="w-2.5 h-2.5 rounded-full bg-[#A3E635]" />;
}
