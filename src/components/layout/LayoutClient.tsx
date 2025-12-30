"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SidebarMobile from "@/components/layout/SidebarMobile";
import BottomMenu from "@/components/layout/BottomMenu";
import TopNavMenu from "@/components/layout/TopNavMenu";
import { useRacha } from "@/context/RachaContext";
import { resolvePublicTenantSlug } from "@/utils/public-links";

const TENANT_STORAGE_KEY = "fut7pro-tenant-slug";

export default function LayoutClient({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname() ?? "";
  const { data: session } = useSession();
  const { tenantSlug, setTenantSlug } = useRacha();
  const slugFromPath = resolvePublicTenantSlug(pathname);
  const sessionSlug =
    typeof (session?.user as any)?.tenantSlug === "string"
      ? (session?.user as any).tenantSlug.trim().toLowerCase()
      : "";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedSlug = window.sessionStorage.getItem(TENANT_STORAGE_KEY) || "";
    const nextSlug = slugFromPath || sessionSlug || storedSlug;

    if (slugFromPath) {
      window.sessionStorage.setItem(TENANT_STORAGE_KEY, slugFromPath);
    } else if (sessionSlug && sessionSlug !== storedSlug) {
      window.sessionStorage.setItem(TENANT_STORAGE_KEY, sessionSlug);
    }

    if (nextSlug && nextSlug !== tenantSlug) {
      setTenantSlug(nextSlug);
    }
  }, [slugFromPath, sessionSlug, tenantSlug, setTenantSlug]);

  return (
    <>
      {/* HEADER FIXO NO TOPO */}
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
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
