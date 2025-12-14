"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBranding } from "@/hooks/useBranding";

type MenuItem = { href: string; label: string };

const menus: MenuItem[] = [
  { href: "/superadmin/dashboard", label: "Dashboard" },
  { href: "/superadmin/rachas", label: "Rachas" },
  { href: "/superadmin/admins", label: "Admins/Presidentes" },
  { href: "/superadmin/financeiro", label: "Financeiro" },
  { href: "/superadmin/planos", label: "Planos & Limites" },
  { href: "/superadmin/suporte", label: "Suporte" },
  { href: "/superadmin/notificacoes", label: "Notificações" },
  { href: "/superadmin/logs", label: "Logs e Auditoria" },
  { href: "/superadmin/integracoes", label: "Integrações" },
  { href: "/superadmin/monitoramento", label: "Monitoramento" },
  { href: "/superadmin/marketing", label: "Marketing & Expansão" },
  { href: "/superadmin/config", label: "Configurações" },
];

export default function SuperAdminSidebar() {
  const { nome } = useBranding({ scope: "superadmin" });
  const brandName = nome || "Fut7Pro";
  const pathname = usePathname() ?? "";

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col py-8 px-4 min-h-screen">
      <div className="text-2xl font-extrabold mb-10 text-yellow-400 text-center drop-shadow">
        {brandName}
        <br />
        <span className="text-sm font-semibold text-yellow-200">Painel SuperAdmin</span>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {menus.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`rounded-lg px-3 py-2 transition-colors font-semibold ${
              pathname.startsWith(m.href)
                ? "bg-yellow-500 text-gray-900 shadow"
                : "hover:bg-gray-800 text-gray-200"
            }`}
          >
            {m.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8 text-xs text-gray-400 text-center opacity-80">
        © 2025 {brandName} SaaS
      </div>
    </aside>
  );
}
