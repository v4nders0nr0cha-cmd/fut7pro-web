"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomMenuAdmin from "@/components/layout/BottomMenuAdmin";
import { NotificationProvider } from "@/context/NotificationContext";
import ToastGlobal from "@/components/ui/ToastGlobal";
import { useRacha } from "@/context/RachaContext";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import PainelAdminBloqueado from "./PainelAdminBloqueado";

function AdminLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181818] to-[#232323] text-white">
      <div className="text-center space-y-2">
        <div className="h-10 w-10 mx-auto rounded-full border-2 border-yellow-400/40 border-t-yellow-400 animate-spin" />
        <p className="text-sm text-gray-300">Carregando painel...</p>
      </div>
    </div>
  );
}

export default function AdminLayoutContent({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const { tenantSlug, rachaId, setTenantSlug, setRachaId } = useRacha();
  const { access, isLoading: accessLoading, error: accessError } = useAdminAccess();

  const isStatusRoute = useMemo(() => pathname.startsWith("/admin/status-assinatura"), [pathname]);

  useEffect(() => {
    if (accessLoading || !access?.tenant) return;
    const nextSlug = access.tenant.slug?.trim() || "";
    const nextId = access.tenant.id?.trim() || "";
    if (nextSlug && nextSlug !== tenantSlug) {
      setTenantSlug(nextSlug);
    }
    if (nextId && nextId !== rachaId) {
      setRachaId(nextId);
    }
  }, [accessLoading, access, tenantSlug, rachaId, setTenantSlug, setRachaId]);

  useEffect(() => {
    if (accessLoading || !accessError) return;
    const status = (accessError as { status?: number })?.status;
    if (status === 401) {
      router.replace("/admin/login");
      return;
    }
    router.replace("/admin/selecionar-racha");
  }, [accessLoading, accessError, router]);

  useEffect(() => {
    if (accessLoading || !access?.blocked) return;
    if (!isStatusRoute) {
      router.replace("/admin/status-assinatura");
    }
  }, [accessLoading, access?.blocked, isStatusRoute, router]);

  if (accessLoading) {
    return <AdminLoading />;
  }

  if (accessError) {
    return null;
  }

  if (access?.blocked && isStatusRoute) {
    return <PainelAdminBloqueado motivo={access.reason || ""} />;
  }

  if (access?.blocked) {
    return <AdminLoading />;
  }

  const readyTenant = access?.tenant?.slug && access.tenant.slug === tenantSlug;
  if (!readyTenant) {
    return <AdminLoading />;
  }

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
