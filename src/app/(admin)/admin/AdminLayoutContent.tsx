"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const ACTIVE_TENANT_COOKIE = "fut7pro_active_tenant";
const LAST_TENANT_STORAGE = "fut7pro_last_tenants";
const PERF_FLAG_KEY = "fut7pro_admin_perf_enabled";
const PERF_START_KEY = "fut7pro_admin_perf_start";

const clearActiveTenantCookie = () => {
  if (typeof document === "undefined") return;
  document.cookie = `${ACTIVE_TENANT_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
};

const trackLastTenantAccess = (slug: string) => {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(LAST_TENANT_STORAGE);
    const data = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    data[slug] = Date.now();
    window.localStorage.setItem(LAST_TENANT_STORAGE, JSON.stringify(data));
  } catch {
    // ignore
  }
};

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
  const perfLoggedRef = useRef(false);

  const isStatusRoute = useMemo(() => pathname.startsWith("/admin/status-assinatura"), [pathname]);
  const readyTenant = access?.tenant?.slug && access.tenant.slug === tenantSlug;

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
    if (nextSlug) {
      trackLastTenantAccess(nextSlug);
    }
  }, [accessLoading, access, tenantSlug, rachaId, setTenantSlug, setRachaId]);

  useEffect(() => {
    if (accessLoading || !accessError) return;
    const status = (accessError as { status?: number })?.status;
    if (status === 401) {
      router.replace("/admin/login");
      return;
    }
    if (status === 400 || status === 403 || status === 404) {
      clearActiveTenantCookie();
    }
    router.replace("/admin/selecionar-racha");
  }, [accessLoading, accessError, router]);

  useEffect(() => {
    if (accessLoading || !access?.blocked) return;
    if (!isStatusRoute) {
      router.replace("/admin/status-assinatura");
    }
  }, [accessLoading, access?.blocked, isStatusRoute, router]);

  useEffect(() => {
    if (accessLoading || !readyTenant || perfLoggedRef.current) return;
    if (typeof window === "undefined") return;
    const perfEnabled = window.sessionStorage.getItem(PERF_FLAG_KEY) === "1";
    const startRaw = window.sessionStorage.getItem(PERF_START_KEY);
    if (!perfEnabled || !startRaw) return;
    const start = Number(startRaw);
    if (Number.isFinite(start)) {
      const delta = Math.max(0, performance.now() - start);
      console.info("[Perf] dashboardReadyMs", Math.round(delta));
      window.sessionStorage.removeItem(PERF_START_KEY);
    }
    perfLoggedRef.current = true;
  }, [accessLoading, readyTenant]);

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
