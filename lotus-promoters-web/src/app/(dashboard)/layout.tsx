"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { CreateOrgModal } from "@/components/modals/CreateOrgModal";
import { useAuthStore } from "@/stores/useAuthStore";
import { useOrgStore } from "@/stores/useOrgStore";
import { useVenueStore } from "@/stores/useVenueStore";
import { useEventStore } from "@/stores/useEventStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { initAuth, isAuthenticated, isInitializing, user } = useAuthStore();
  const { loadOrgs, getActiveOrg } = useOrgStore();
  const { loadVenues } = useVenueStore();
  const { loadEvents } = useEventStore();
  const [isNewOrgModalOpen, setIsNewOrgModalOpen] = React.useState(false);

  // Initialize Firebase Auth listener once on mount
  React.useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Load organizations and sub-resources when authenticated user is available
  React.useEffect(() => {
    if (isAuthenticated && user?.uid) {
      loadOrgs(user.uid).then(() => {
        // After orgs load, get the active org to load venues and events
        const activeOrg = getActiveOrg();
        if (activeOrg?.id) {
          loadVenues(activeOrg.id);
          loadEvents(activeOrg.id);
        }
      });
    }
  }, [isAuthenticated, user?.uid, loadOrgs, loadVenues, loadEvents, getActiveOrg]);

  // Redirect to login when auth is resolved and user is not authenticated
  React.useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isInitializing, isAuthenticated, router]);

  // Show loading screen while Firebase resolves the session
  if (isInitializing) {
    return (
      <div className="flex min-h-screen bg-[#0B0E14] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#A3E635] border-t-transparent animate-spin" />
          <p className="text-xs text-[#64748B]">A verificar sessão...</p>
        </div>
      </div>
    );
  }

  // Don't render the protected layout if not authenticated (redirect pending)
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#0B0E14] text-[#F8FAFC]">
      {/* Sidebar */}
      <Sidebar onNewOrgClick={() => setIsNewOrgModalOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Create Organization Modal */}
      <CreateOrgModal
        isOpen={isNewOrgModalOpen}
        onClose={() => setIsNewOrgModalOpen(false)}
      />
    </div>
  );
}

