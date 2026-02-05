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
import { rachaConfig } from "@/config/racha.config";

export default function LayoutClient({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname() ?? "";
  const { tenantSlug, setTenantSlug } = useRacha();
  const slugFromPath = resolvePublicTenantSlug(pathname);
  const defaultSlug = (rachaConfig.slug || "").trim().toLowerCase();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (slugFromPath) {
      if (slugFromPath !== tenantSlug) {
        setTenantSlug(slugFromPath);
      }
      return;
    }

    if (defaultSlug && tenantSlug !== defaultSlug) {
      setTenantSlug(defaultSlug);
    }
  }, [slugFromPath, tenantSlug, setTenantSlug, defaultSlug]);

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
