"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SidebarMobile from "@/components/layout/SidebarMobile";
import BottomMenu from "@/components/layout/BottomMenu";
import TopNavMenu from "@/components/layout/TopNavMenu";
import PublicAuthFeedbackCoordinator from "@/components/layout/PublicAuthFeedbackCoordinator";
import PendingMembershipBanner from "@/components/layout/PendingMembershipBanner";
import ComunicadosLoginGate from "@/components/comunicacao/ComunicadosLoginGate";
import ToasterProvider from "@/components/ToasterProvider";
import { useRacha } from "@/context/RachaContext";
import { resolvePublicTenantSlug } from "@/utils/public-links";
import { setStoredTenantSlug } from "@/utils/active-tenant";

export default function LayoutClient({
  children,
  initialTenantSlug,
}: {
  children: ReactNode;
  initialTenantSlug?: string | null;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const pathname = usePathname() ?? "";
  const { tenantSlug, setTenantSlug } = useRacha();
  const slugFromPath = resolvePublicTenantSlug(pathname);

  useEffect(() => setSidebarOpen(false), [pathname]);

  useEffect(() => {
    if (slugFromPath) {
      if (slugFromPath !== tenantSlug) {
        setTenantSlug(slugFromPath);
        setStoredTenantSlug(slugFromPath);
      }
      return;
    }

    const fromInitial = (initialTenantSlug || "").trim().toLowerCase();
    if (fromInitial && tenantSlug !== fromInitial) {
      setTenantSlug(fromInitial);
      setStoredTenantSlug(fromInitial);
    }
  }, [slugFromPath, tenantSlug, setTenantSlug, initialTenantSlug]);

  return (
    <>
      <ToasterProvider />
      <PublicAuthFeedbackCoordinator />
      {/* HEADER FIXO NO TOPO */}
      <Header onOpenSidebar={openSidebar} />
      <ComunicadosLoginGate />
      <SidebarMobile open={sidebarOpen} onClose={closeSidebar} />

      {/* ESPAÇAMENTO PARA O HEADER */}
      <div className="h-16 lg:h-[72px] w-full" />

      {/* TOPO DE NAVEGAÇÃO VISÍVEL APENAS NO DESKTOP */}
      <div className="hidden lg:block w-full bg-transparent relative z-30">
        <TopNavMenu />
      </div>

      {/* ESPAÇAMENTO PARA O TOPNAVMENU */}
      <div className="hidden lg:block h-3 w-full" />
      <PendingMembershipBanner />

      {/* CONTEÚDO PRINCIPAL SEM WRAPPER GLOBAL */}
      <main className="min-h-screen flex flex-col w-full pt-10 lg:pt-5 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-8">
        {children}
      </main>

      <Footer />
      <BottomMenu />
    </>
  );
}
