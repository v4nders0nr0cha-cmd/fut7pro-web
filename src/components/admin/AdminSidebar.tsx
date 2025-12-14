"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
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
  FaChartLine,
  FaFileAlt,
  FaSignOutAlt,
} from "react-icons/fa";

import { Role } from "@/common/enums";
import { useBranding } from "@/hooks/useBranding";

interface AdminSidebarProps {
  racha?: {
    id: string;
    name: string;
    tenantId?: string;
  };
}

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  roles?: Role[];
}

const allRoles = [
  Role.GERENTE,
  Role.SUPERADMIN,
  Role.ADMIN,
  Role.ATLETA,
  Role.ATHLETE,
  Role.SUPORTE,
  Role.FINANCEIRO,
  Role.MARKETING,
  Role.AUDITORIA,
] as Role[];

const menu: MenuItem[] = [
  { label: "Dashboard", icon: FaHome, href: "/admin/dashboard", roles: allRoles },
  { label: "Jogadores", icon: FaUsers, href: "/admin/jogadores", roles: allRoles },
  { label: "Partidas", icon: FaCalendarAlt, href: "/admin/partidas", roles: allRoles },
  {
    label: "Ranking & Estatísticas",
    icon: FaChartBar,
    href: "/admin/estatisticas",
    roles: allRoles,
  },
  { label: "Conquistas", icon: FaTrophy, href: "/admin/conquistas", roles: allRoles },
  {
    label: "Financeiro",
    icon: FaMoneyBill,
    href: "/admin/financeiro",
    roles: [Role.GERENTE, Role.FINANCEIRO, Role.ADMIN, Role.SUPERADMIN],
  },
  {
    label: "Analytics",
    icon: FaChartLine,
    href: "/admin/analytics",
    roles: [
      Role.FINANCEIRO,
      Role.MARKETING,
      Role.AUDITORIA,
      Role.GERENTE,
      Role.ADMIN,
      Role.SUPERADMIN,
    ],
  },
  {
    label: "Relatórios",
    icon: FaFileAlt,
    href: "/admin/relatorios",
    roles: [
      Role.FINANCEIRO,
      Role.MARKETING,
      Role.AUDITORIA,
      Role.GERENTE,
      Role.ADMIN,
      Role.SUPERADMIN,
    ],
  },
  {
    label: "Administradores",
    icon: FaUserShield,
    href: "/admin/administracao/administradores",
    roles: [Role.GERENTE, Role.ADMIN, Role.SUPERADMIN],
  },
  { label: "Notificações", icon: FaBullhorn, href: "/admin/notificacoes", roles: allRoles },
  { label: "Configurações", icon: FaCogs, href: "/admin/configuracoes", roles: allRoles },
];

export default function AdminSidebar({ racha }: AdminSidebarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { nome, logo } = useBranding({ scope: "admin" });

  const user = session?.user as (typeof session)["user"] & { role?: Role };
  const userRole = (user?.role as Role | undefined) ?? Role.GERENTE;
  const pathname = router?.pathname ?? "";

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const allowedMenu = menu.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  const renderLink = (item: MenuItem) => {
    if (!item.href) return null;
    const isActive = pathname === item.href;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all select-none ${
          isActive
            ? "bg-blue-600 text-white shadow"
            : "text-[#b9c1d2] hover:bg-[#2c3141] hover:text-yellow-300"
        }`}
        aria-label={item.label}
      >
        <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-[#b9c1d2]"}`} />
        {item.label}
      </Link>
    );
  };

  return (
    <>
      <button
        className="md:hidden p-2 text-white bg-[#1f2937] fixed top-4 left-4 z-40 rounded"
        aria-label="Toggle menu"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        ☰
      </button>

      <aside
        role="navigation"
        className={`md:flex flex-col w-64 fixed left-0 top-[64px] bottom-0 z-30 bg-[#20232A] py-6 px-3 border-r border-[#292e38] transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col items-center gap-2 mb-8">
          <Image
            src={user?.image || logo}
            alt={user?.name || nome}
            width={80}
            height={80}
            className="object-contain rounded-full"
          />
          <span className="text-lg font-semibold text-yellow-400 text-center truncate max-w-[180px]">
            {racha?.name ?? nome ?? "Seu Racha"}
          </span>
          {user && (
            <div className="text-center text-sm text-white">
              <p>{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto admin-sidebar-scroll">
          {allowedMenu.map(renderLink)}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 flex items-center gap-2 text-red-400 hover:text-red-200 px-3 py-2 rounded-lg transition-colors"
        >
          <FaSignOutAlt />
          Sair
        </button>

        <div className="mt-4 text-xs text-center text-[#8d95a9] px-2 opacity-80 select-none">
          © {new Date().getFullYear()} {nome}
        </div>
      </aside>
    </>
  );
}
