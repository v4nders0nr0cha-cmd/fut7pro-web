"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaBell,
  FaEnvelope,
  FaUserPlus,
  FaUser,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import { useAdminBadges } from "@/hooks/useAdminBadges";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import type { IconType } from "react-icons";

type BadgeKey = "notificacoes" | "mensagens" | "solicitacoes";

interface MenuItem {
  label: string;
  icon: IconType;
  href: string;
  badgeKey: BadgeKey;
}

const menu: MenuItem[] = [
  {
    label: "Notificações",
    icon: FaBell,
    href: "/admin/notificacoes",
    badgeKey: "notificacoes",
  },
  {
    label: "Mensagens",
    icon: FaEnvelope,
    href: "/admin/mensagens",
    badgeKey: "mensagens",
  },
  {
    label: "Solicitações",
    icon: FaUserPlus,
    href: "/admin/jogadores/solicitacoes",
    badgeKey: "solicitacoes",
  },
];

type HeaderProps = {
  onMenuClick?: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { badges } = useAdminBadges();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="fixed left-0 top-0 z-50 flex h-[56px] w-full items-center border-b border-yellow-400 bg-zinc-900 px-4 py-2 shadow-[0_2px_12px_rgba(255,215,0,0.25)]">
      {/* MOBILE: Botão hamburguer */}
      <button
        onClick={onMenuClick}
        className="mr-2 flex items-center justify-center rounded-full p-2 text-yellow-400 hover:bg-zinc-800 md:hidden"
        aria-label="Abrir menu"
        tabIndex={0}
      >
        <FaBars size={24} />
      </button>

      {/* LOGO */}
      <Link
        href="/admin/dashboard"
        className="flex select-none items-center gap-2"
        tabIndex={0}
      >
        <span className="inline-block h-9 w-9 overflow-hidden rounded-full bg-yellow-400">
          <Image
            src="/images/logos/logo_fut7pro.png"
            alt="Logo Fut7Pro Painel Admin"
            width={36}
            height={36}
            className="rounded-full"
            priority
          />
        </span>
      </Link>

      {/* AÇÕES ALINHADAS À DIREITA */}
      <div className="ml-auto flex items-center gap-6">
        {menu.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const badgeValue = badges[item.badgeKey] ?? 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center gap-2 rounded px-2 py-1 transition hover:bg-zinc-800"
              tabIndex={0}
            >
              <item.icon size={20} className="text-yellow-400" />
              <span className="hidden text-sm font-medium text-white sm:inline">
                {item.label}
              </span>
              {badgeValue > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">
                  {badgeValue}
                </span>
              )}
            </Link>
          );
        })}

        {/* LOGIN OU PERFIL */}
        {!isLoggedIn ? (
          <button
            className="flex items-center gap-2 rounded-full border border-yellow-400 bg-[#222] px-4 py-1.5 text-sm font-bold uppercase text-yellow-400 shadow-md transition-all hover:bg-yellow-400 hover:text-black"
            onClick={() => router.push("/admin/login")}
          >
            <FaUser size={16} className="text-yellow-400" />
            Entrar ou Cadastrar-se
          </button>
        ) : (
          <div
            className="group relative flex cursor-pointer items-center gap-2"
            onClick={() => setDropdownOpen((v) => !v)}
            tabIndex={0}
          >
            <Image
              src={session.user?.image ?? "/images/avatar_padrao_admin.png"}
              alt={session.user?.name ?? "Admin"}
              width={38}
              height={38}
              className="rounded-full border-2 border-yellow-400"
            />
            <span className="hidden text-base font-bold text-yellow-300 md:inline">
              {session.user?.name ?? "Admin"}
            </span>
            {dropdownOpen && (
              <div className="absolute right-0 top-12 z-50 flex w-44 flex-col rounded border border-zinc-800 bg-zinc-900 py-2 shadow-md">
                <button
                  className="flex items-center gap-2 px-4 py-2 text-base text-red-500 hover:bg-zinc-800"
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                >
                  <FaSignOutAlt size={18} />
                  Sair do painel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
