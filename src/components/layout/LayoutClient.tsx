"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SidebarMobile from "@/components/layout/SidebarMobile";
import BottomMenu from "@/components/layout/BottomMenu";
import TopNavMenu from "@/components/layout/TopNavMenu";

export default function LayoutClient({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* HEADER FIXO NO TOPO */}
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
      <SidebarMobile open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ESPAÇAMENTO PARA O HEADER */}
      <div className="h-14 w-full md:h-[72px]" />

      {/* TOPO DE NAVEGAÇÃO VISÍVEL APENAS NO DESKTOP */}
      <div className="relative z-30 hidden w-full bg-transparent md:block">
        <TopNavMenu />
      </div>

      {/* ESPAÇAMENTO PARA O TOPNAVMENU */}
      <div className="hidden h-3 w-full md:block" />

      {/* CONTEÚDO PRINCIPAL SEM WRAPPER GLOBAL */}
      <main className="flex min-h-screen w-full flex-col pb-20 pt-10 md:pb-8 md:pt-5">
        {children}
      </main>

      <Footer />
      <BottomMenu />
    </>
  );
}
