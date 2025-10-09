"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
// importe aqui seus componentes de layout do painel, ex. Sidebar, Topbar, etc.

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Não aplicar o layout do painel em /admin/login (nem em páginas de auth do admin)
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/recuperar") ||
    pathname.startsWith("/admin/register")
  ) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-zinc-950 text-white">
      {/* <Sidebar /> */}
      <div className="flex-1">
        {/* <Topbar /> */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
