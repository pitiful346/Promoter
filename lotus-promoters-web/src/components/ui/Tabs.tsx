import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn("flex items-center gap-1 p-1 bg-[#121824] rounded-xl border border-white/10 w-fit", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-2",
              isActive
                ? "bg-[#1F2B42] text-[#F8FAFC] shadow-sm border border-white/10 font-semibold"
                : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full",
                  isActive ? "bg-[#A3E635] text-black font-bold" : "bg-[#1E293B] text-[#64748B]"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
