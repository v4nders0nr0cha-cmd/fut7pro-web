"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SidebarMobile from "@/components/layout/SidebarMobile";
import BottomMenu from "@/components/layout/BottomMenu";
import TopNavMenu from "@/components/layout/TopNavMenu";
import ComunicadosLoginGate from "@/components/comunicacao/ComunicadosLoginGate";
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
  const pathname = usePathname() ?? "";
  const { tenantSlug, setTenantSlug } = useRacha();
  const slugFromPath = resolvePublicTenantSlug(pathname);

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
      {/* HEADER FIXO NO TOPO */}
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
      <ComunicadosLoginGate />
      <SidebarMobile open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ESPAÇAMENTO PARA O HEADER */}
      <div className="h-14 md:h-[72px] w-full" />

      {/* TOPO DE NAVEGAÇÃO VISÍVEL APENAS NO DESKTOP */}
      <div className="hidden md:block w-full bg-transparent relative z-30">
        <TopNavMenu />
      </div>

      {/* ESPAÇAMENTO PARA O TOPNAVMENU */}
      <div className="hidden md:block h-3 w-full" />

      {/* CONTEÚDO PRINCIPAL SEM WRAPPER GLOBAL */}
      <main className="min-h-screen flex flex-col w-full pt-10 md:pt-5 pb-20 md:pb-8">
        {children}
      </main>

      <Footer />
      <BottomMenu />
    </>
  );
}
