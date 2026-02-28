"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const { data, status } = useSession();
  const router = useRouter();
  const role = (data?.user as any)?.role;
  const accessToken = String((data?.user as any)?.accessToken || "").trim();
  const tokenError = String((data?.user as any)?.tokenError || "").trim();
  const isSuperAdmin =
    (role === "SUPERADMIN" || role === "superadmin") && Boolean(accessToken) && !tokenError;
  const signOutSuper = (params?: any) =>
    (signOut as any)({ basePath: "/api/superadmin-auth", ...params });

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/superadmin/login");
      return;
    }

    if (status === "authenticated" && !isSuperAdmin) {
      signOutSuper({ callbackUrl: "/superadmin/login" }).catch(() => {
        router.replace("/superadmin/login");
      });
    }
  }, [isSuperAdmin, router, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-200">
        Carregando...
      </div>
    );
  }

  if (!isSuperAdmin) {
    return null;
  }

  return <>{children}</>;
}
