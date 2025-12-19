"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

export function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const { data, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname?.startsWith("/superadmin/login");
  const role = (data?.user as any)?.role;
  const isSuperAdmin = role === "SUPERADMIN" || role === "superadmin";

  useEffect(() => {
    if (status === "loading") return;

    // Em qualquer rota superadmin (exceto login), exigir superadmin
    if (!isLoginPage) {
      if (status === "unauthenticated") {
        router.replace("/superadmin/login");
        return;
      }
      if (status === "authenticated" && !isSuperAdmin) {
        signOut({ callbackUrl: "/superadmin/login" }).catch(() => {
          router.replace("/superadmin/login");
        });
      }
      return;
    }

    // Na pagina de login: se ja for superadmin, redireciona para dashboard
    if (isLoginPage && status === "authenticated" && isSuperAdmin) {
      router.replace("/superadmin/dashboard");
    }
  }, [isLoginPage, isSuperAdmin, router, status]);

  if (isLoginPage) {
    // login deve carregar mesmo sem sessao
    return <>{children}</>;
  }

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
