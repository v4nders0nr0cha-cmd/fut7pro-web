// src/components/superadmin/SuperAdminSidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { rachaConfig } from "@/config/racha.config";

// Tipagem explícita:
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
  const pathname = usePathname() ?? "";
  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-gray-800 bg-gray-900 px-4 py-8">
      <div className="mb-10 text-center text-2xl font-extrabold text-yellow-400 drop-shadow">
        Fut7Pro
        <br />
        <span className="text-xl font-bold text-yellow-400">
          {rachaConfig.nome}
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {menus.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`rounded-lg px-3 py-2 font-semibold transition-colors ${
              pathname.startsWith(m.href)
                ? "bg-yellow-500 text-gray-900 shadow"
                : "text-gray-200 hover:bg-gray-800"
            }`}
          >
            {m.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8 text-center text-xs text-gray-400 opacity-80">
        © 2025 {rachaConfig.nome} SaaS
      </div>
    </aside>
  );
}
