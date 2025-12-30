"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaBell, FaEnvelope, FaUserPlus, FaUser, FaSignOutAlt, FaBars } from "react-icons/fa";
import { useAdminBadges } from "@/hooks/useAdminBadges";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import type { IconType } from "react-icons";
import { useMe } from "@/hooks/useMe";
import { buildPublicHref } from "@/utils/public-links";

type BadgeKey = "notificacoes" | "mensagens" | "solicitacoes";

interface MenuItem {
  label: string;
  icon: IconType;
  href: string;
  badgeKey: BadgeKey;
}

const menu: MenuItem[] = [
  { label: "Notificações", icon: FaBell, href: "/admin/notificacoes", badgeKey: "notificacoes" },
  { label: "Mensagens", icon: FaEnvelope, href: "/admin/mensagens", badgeKey: "mensagens" },
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
  const { me } = useMe();
  const isLoggedIn = !!session?.user;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const displayName = me?.athlete?.firstName || session?.user?.name || "Admin";
  const displayAvatar =
    me?.athlete?.avatarUrl || session?.user?.image || "/images/avatar_padrao_admin.png";
  const tenantSlug = me?.tenant?.tenantSlug || (session?.user as any)?.tenantSlug || null;
  const publicProfileHref =
    tenantSlug && me?.athlete?.slug
      ? buildPublicHref(`/atletas/${me.athlete.slug}`, tenantSlug)
      : null;

  return (
    <header className="w-full z-50 top-0 left-0 bg-zinc-900 border-b border-yellow-400 shadow-[0_2px_12px_rgba(255,215,0,0.25)] flex items-center px-4 py-2 h-[56px] fixed">
      {/* MOBILE: Botão hamburguer */}
      <button
        onClick={onMenuClick}
        className="md:hidden flex items-center justify-center mr-2 text-yellow-400 hover:bg-zinc-800 p-2 rounded-full"
        aria-label="Abrir menu"
        tabIndex={0}
      >
        <FaBars size={24} />
      </button>

      {/* MARCA FIXA FUT7PRO (admin) */}
      <Link href="/admin/dashboard" className="flex items-center gap-2 select-none" tabIndex={0}>
        <span className="text-white font-extrabold text-lg tracking-tight">
          Fut
          <span className="text-yellow-400 animate-pulse drop-shadow-[0_0_12px_rgba(250,204,21,0.75)]">
            7
          </span>
          Pro
        </span>
      </Link>

      {/* AÇÕES ALINHADAS À DIREITA */}
      <div className="flex items-center gap-6 ml-auto">
        {menu.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const badgeValue = badges[item.badgeKey] ?? 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-800 transition"
              tabIndex={0}
            >
              <item.icon size={20} className="text-yellow-400" />
              <span className="text-white text-sm font-medium hidden sm:inline">{item.label}</span>
              {badgeValue > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 font-bold">
                  {badgeValue}
                </span>
              )}
            </Link>
          );
        })}

        {/* LOGIN OU PERFIL */}
        {!isLoggedIn ? (
          <button
            className="flex items-center gap-2 border border-yellow-400 bg-[#222] text-yellow-400 px-4 py-1.5 rounded-full font-bold text-sm uppercase shadow-md hover:bg-yellow-400 hover:text-black transition-all"
            onClick={() => router.push("/admin/login")}
          >
            <FaUser size={16} className="text-yellow-400" />
            Entrar ou Cadastrar-se
          </button>
        ) : (
          <div
            className="flex items-center gap-2 group relative cursor-pointer"
            onClick={() => setDropdownOpen((v) => !v)}
            tabIndex={0}
          >
            <img
              src={displayAvatar}
              alt={displayName}
              width={38}
              height={38}
              className="rounded-full border-2 border-yellow-400"
              onError={(event) => {
                event.currentTarget.src = "/images/avatar_padrao_admin.png";
              }}
            />
            <span className="text-yellow-300 font-bold text-base hidden md:inline">
              {displayName}
            </span>
            {dropdownOpen && (
              <div className="absolute top-12 right-0 bg-zinc-900 border border-zinc-800 rounded shadow-md w-44 py-2 z-50 flex flex-col">
                <Link
                  href="/admin/perfil"
                  className="flex items-center gap-2 px-4 py-2 text-white hover:bg-zinc-800 text-base"
                  onClick={() => setDropdownOpen(false)}
                >
                  Meu perfil
                </Link>
                <Link
                  href="/admin/perfil/editar"
                  className="flex items-center gap-2 px-4 py-2 text-white hover:bg-zinc-800 text-base"
                  onClick={() => setDropdownOpen(false)}
                >
                  Editar perfil
                </Link>
                {publicProfileHref && (
                  <Link
                    href={publicProfileHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-white hover:bg-zinc-800 text-base"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Ver perfil publico
                  </Link>
                )}
                <button
                  className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-zinc-800 text-base"
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
