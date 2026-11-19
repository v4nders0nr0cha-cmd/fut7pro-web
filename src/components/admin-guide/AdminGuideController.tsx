"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useRacha } from "@/context/RachaContext";
import { useAdminGuide } from "@/hooks/useAdminGuide";
import { GUIDE_ACCESS_USED, notifyGuideAccess } from "@/lib/admin-guide-access";

export type ManualGuideRequest = { id: number; scope: string; pathname: string };
export type AdminGuideControllerValue = {
  scope: string;
  slug: string;
  loginId: string;
  request: ManualGuideRequest | null;
  openGuide: () => void;
  closeGuide: () => void;
  state: ReturnType<typeof useAdminGuide>;
};
const Controller = createContext<AdminGuideControllerValue | null>(null);
export function useAdminGuideController() {
  return useContext(Controller);
}
export function AdminGuideControllerProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const { tenantSlug, rachaId } = useRacha();
  const pathname = usePathname() ?? "";
  const state = useAdminGuide();
  const user = session?.user as { id?: string; onboardingLoginId?: string } | undefined;
  const slug = tenantSlug.trim().toLowerCase();
  const loginId = user?.onboardingLoginId ?? "";
  // Disponível antes da consulta do guia, sem confundir refresh de token com login.
  const scope =
    user?.id && rachaId && slug && loginId ? `identity:${user.id}:${rachaId}:${loginId}` : "";
  const [request, setRequest] = useState<ManualGuideRequest | null>(null);
  const sequence = useRef(0);
  const guide = useRef(state.guide);
  guide.current = state.guide;
  const openGuide = useCallback(() => {
    if (!scope || !pathname.startsWith("/admin/")) return;
    setRequest({ id: ++sequence.current, scope, pathname });
    if (guide.current)
      notifyGuideAccess(GUIDE_ACCESS_USED, {
        tenantId: guide.current.tenant.id,
        membershipId: guide.current.administrator.membershipId,
      });
  }, [scope, pathname]);
  const closeGuide = useCallback(() => setRequest(null), []);
  useEffect(() => {
    setRequest((current) =>
      current && (current.scope !== scope || current.pathname !== pathname) ? null : current
    );
  }, [scope, pathname]);
  return (
    <Controller.Provider value={{ scope, slug, loginId, request, openGuide, closeGuide, state }}>
      {children}
    </Controller.Provider>
  );
}
