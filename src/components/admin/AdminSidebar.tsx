// src/components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaChartBar,
  FaTrophy,
  FaMoneyBill,
  FaUserShield,
  FaBullhorn,
  FaCogs,
} from "react-icons/fa";
import Image from "next/image";
import { rachaConfig } from "@/config/racha.config";

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const menu: MenuItem[] = [
  { label: "Dashboard", icon: FaHome, href: "/admin/dashboard" },
  { label: "Jogadores", icon: FaUsers, href: "/admin/jogadores" },
  { label: "Partidas", icon: FaCalendarAlt, href: "/admin/partidas" },
  { label: "Ranking & Estatísticas", icon: FaChartBar, href: "/admin/estatisticas" },
  { label: "Conquistas", icon: FaTrophy, href: "/admin/conquistas" },
  { label: "Financeiro", icon: FaMoneyBill, href: "/admin/financeiro" },
  { label: "Prestação de Contas", icon: FaUserShield, href: "/admin/prestacao" },
  { label: "Patrocinadores", icon: FaBullhorn, href: "/admin/patrocinadores" },
  { label: "Notificações", icon: FaBullhorn, href: "/admin/notificacoes" },
  { label: "Configurações", icon: FaCogs, href: "/admin/configuracoes" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-64 fixed left-0 top-[64px] bottom-0 z-30 bg-[#20232A] py-6 px-3 border-r border-[#292e38]">
      <div className="flex flex-col items-center gap-2 mb-8">
        <Image
          src={rachaConfig.logo}
          alt={`Logo do ${rachaConfig.nome} – Plataforma SaaS de Rachas`}
          width={80}
          height={80}
          className="object-contain"
        />
        <span className="text-lg font-semibold text-yellow-400 text-center truncate max-w-[180px]">
          {process.env.NEXT_PUBLIC_RACHA_NOME ?? "Seu Racha"}
        </span>
      </div>
      {/* NAV: agora com scrollbar premium dark/fino só on-hover */}
      <nav className="flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto admin-sidebar-scroll">
        {menu.map(({ label, icon: Icon, href }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all select-none
                            ${
                              pathname === href
                                ? "bg-gradient-to-r from-yellow-400/20 to-yellow-700/10 text-yellow-300 shadow text-base"
                                : "text-[#b9c1d2] hover:bg-[#2c3141] hover:text-yellow-300"
                            }`}
            aria-label={label}
          >
            <Icon
              className={`w-5 h-5 ${pathname === href ? "text-yellow-300" : "text-[#b9c1d2] group-hover:text-yellow-400"}`}
            />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-8 text-xs text-center text-[#8d95a9] px-2 opacity-80 select-none">
        © {new Date().getFullYear()} {rachaConfig.nome}
      </div>
    </aside>
  );
}
