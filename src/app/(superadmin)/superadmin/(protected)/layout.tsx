import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import dynamic from "next/dynamic";
import AdminLayoutContent from "../SuperAdminLayoutContent";
import { SuperAdminGuard } from "@/components/superadmin/SuperAdminGuard";
import { superAdminAuthOptions } from "@/server/auth/superadmin-options";

const SuperAdminProviders = dynamic(() => import("@/components/superadmin/SuperAdminProviders"), {
  ssr: false,
});

type SuperAdminSession = {
  user?: {
    role?: string | null;
    accessToken?: string | null;
    tokenError?: string | null;
  } | null;
} | null;

export default async function SuperAdminProtectedLayout({ children }: { children: ReactNode }) {
  const session = (await getServerSession(superAdminAuthOptions as any)) as SuperAdminSession;
  const role = String(session?.user?.role || "").toUpperCase();
  const accessToken = String(session?.user?.accessToken || "").trim();
  const tokenError = String(session?.user?.tokenError || "").trim();

  // SSR guard: nunca renderiza estrutura interna antes de validar sessão.
  if (!session?.user || role !== "SUPERADMIN" || !accessToken || tokenError) {
    redirect("/superadmin/login");
  }

  return (
    <SuperAdminProviders>
      <SuperAdminGuard>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </SuperAdminGuard>
    </SuperAdminProviders>
  );
}
