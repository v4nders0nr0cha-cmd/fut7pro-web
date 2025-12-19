"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const { data, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    const role = (data?.user as any)?.role;
    if (!role || (role !== "SUPERADMIN" && role !== "superadmin")) {
      // Expulsa se nao for superadmin
      signOut({ callbackUrl: "/superadmin/login" }).catch(() => {
        router.replace("/superadmin/login");
      });
    }
  }, [data?.user, router, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-200">
        Carregando...
      </div>
    );
  }

  const role = (data?.user as any)?.role;
  if (!role || (role !== "SUPERADMIN" && role !== "superadmin")) {
    return null;
  }

  return <>{children}</>;
}
