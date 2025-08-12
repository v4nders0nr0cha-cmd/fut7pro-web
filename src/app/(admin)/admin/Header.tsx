"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaBell, FaEnvelope, FaUserPlus, FaUser, FaSignOutAlt, FaBars } from "react-icons/fa";
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
  const isLoggedIn = !!session?.user;
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

      {/* LOGO */}
      <Link href="/admin/dashboard" className="flex items-center gap-2 select-none" tabIndex={0}>
        <span className="inline-block rounded-full overflow-hidden w-9 h-9 bg-yellow-400">
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
            <Image
              src={session.user?.image ?? "/images/avatar_padrao_admin.png"}
              alt={session.user?.name ?? "Admin"}
              width={38}
              height={38}
              className="rounded-full border-2 border-yellow-400"
            />
            <span className="text-yellow-300 font-bold text-base hidden md:inline">
              {session.user?.name ?? "Admin"}
            </span>
            {dropdownOpen && (
              <div className="absolute top-12 right-0 bg-zinc-900 border border-zinc-800 rounded shadow-md w-44 py-2 z-50 flex flex-col">
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
