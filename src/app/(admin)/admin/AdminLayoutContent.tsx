"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomMenuAdmin from "@/components/layout/BottomMenuAdmin";
import { NotificationProvider } from "@/context/NotificationContext";
import ToastGlobal from "@/components/ui/ToastGlobal";
import { useMe } from "@/hooks/useMe";
import { useRacha } from "@/context/RachaContext";

export default function AdminLayoutContent({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { me } = useMe({ context: "admin" });
  const { tenantSlug, rachaId, setTenantSlug, setRachaId } = useRacha();

  useEffect(() => {
    const slug = me?.tenant?.tenantSlug?.trim() || "";
    const id = me?.tenant?.tenantId?.trim() || "";
    if (slug && slug !== tenantSlug) {
      setTenantSlug(slug);
    }
    if (id && id !== rachaId) {
      setRachaId(id);
    }
  }, [
    me?.tenant?.tenantSlug,
    me?.tenant?.tenantId,
    tenantSlug,
    rachaId,
    setTenantSlug,
    setRachaId,
  ]);

  return (
    <NotificationProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#181818] to-[#232323]">
        <ToastGlobal />
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        <div className="flex flex-1">
          <Sidebar />
          <Sidebar mobile isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
          <main className="flex-1 w-full px-4 sm:px-6 pt-20 md:pt-15 pb-24">{children}</main>
        </div>
        <BottomMenuAdmin />
      </div>
    </NotificationProvider>
  );
}
