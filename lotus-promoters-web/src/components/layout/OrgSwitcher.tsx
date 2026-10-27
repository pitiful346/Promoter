"use client";

import * as React from "react";
import { useOrgStore } from "@/stores/useOrgStore";
import { ChevronsUpDown, Check, Plus, Building2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrgSwitcherProps {
  onNewOrgClick?: () => void;
}

export const OrgSwitcher: React.FC<OrgSwitcherProps> = ({ onNewOrgClick }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { organizations, activeOrgId, setActiveOrgId, getActiveOrg } = useOrgStore();
  const activeOrg = getActiveOrg();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all duration-200 text-left",
          "bg-[#161F30]/80 hover:bg-[#1C273D] border-white/10 hover:border-white/20",
          isOpen && "border-[#A3E635]/40 ring-1 ring-[#A3E635]/30"
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {activeOrg?.logo_url ? (
            <img
              src={activeOrg.logo_url}
              alt={activeOrg.name}
              className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#1E293B] flex items-center justify-center shrink-0 border border-white/10">
              <Building2 className="w-4 h-4 text-[#A3E635]" />
            </div>
          )}
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-[#F8FAFC] truncate block">
                {activeOrg?.name || "Selecionar Organização"}
              </span>
              {activeOrg?.is_verified && (
                <ShieldCheck className="w-3.5 h-3.5 text-[#A3E635] shrink-0" />
              )}
            </div>
            <span className="text-[11px] text-[#94A3B8] block truncate">
              {activeOrg?.slug || "organização"}
            </span>
          </div>
        </div>
        <ChevronsUpDown className="w-4 h-4 text-[#64748B] shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#121824] border border-white/15 rounded-xl shadow-2xl p-1.5 z-50 backdrop-blur-2xl animate-scale-up">
          <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider px-3 py-1.5">
            As Tuas Organizações
          </div>

          <div className="space-y-1">
            {organizations.map((org) => {
              const isSelected = org.id === activeOrgId;
              return (
                <button
                  key={org.id}
                  onClick={() => {
                    setActiveOrgId(org.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                    isSelected
                      ? "bg-[#1F2B42] text-[#A3E635] font-medium"
                      : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {org.logo_url ? (
                      <img
                        src={org.logo_url}
                        alt={org.name}
                        className="w-6 h-6 rounded-md object-cover border border-white/10 shrink-0"
                      />
                    ) : (
                      <Building2 className="w-4 h-4 shrink-0 text-[#64748B]" />
                    )}
                    <span className="truncate">{org.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#A3E635] shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="my-1 border-t border-white/[0.08]" />

          <button
            onClick={() => {
              setIsOpen(false);
              onNewOrgClick?.();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#A3E635] hover:bg-[#A3E635]/10 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Nova Organização</span>
          </button>
        </div>
      )}
    </div>
  );
};
