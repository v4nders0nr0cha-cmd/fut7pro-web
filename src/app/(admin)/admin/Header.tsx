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
  // Alinhado ao padrão oficial: solicitações → /admin/jogadores/listar-cadastrar
  {
    label: "Solicitações",
    icon: FaUserPlus,
    href: "/admin/jogadores/listar-cadastrar",
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

  const closeDropdown = () => setDropdownOpen(false);

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
      <Link
        href="/admin/dashboard"
        className="flex items-center gap-3 select-none group"
        tabIndex={0}
      >
        <Image
          src="/images/logos/logo_fut7pro.png"
          alt="Logo Fut7Pro Painel Admin"
          width={40}
          height={40}
          className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,215,0,0.4)]"
          priority
        />
        <span className="text-white font-black text-xl tracking-wide drop-shadow-[0_0_12px_rgba(255,215,0,0.45)]">
          Fut
          <span className="text-yellow-400 animate-pulse drop-shadow-[0_0_14px_rgba(255,215,0,0.7)]">7</span>
          Pro
        </span>
      </Link>

      {/* AÇÕES ALINHADAS À DIREITA */}
      <div className="flex items-center gap-6 ml-auto">
        {menu.map((item) => {
          const badgeValue = badges[item.badgeKey] ?? 0;
          const isActive = pathname.startsWith(item.href);
          const highlight = badgeValue > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded transition ${
                isActive ? "bg-zinc-800 text-yellow-200" : "hover:bg-zinc-800"
              } ${highlight ? "ring-2 ring-yellow-400/80 shadow-[0_0_12px_rgba(255,215,0,0.45)]" : ""}`}
              tabIndex={0}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon
                size={18}
                className={highlight ? "text-yellow-200" : "text-yellow-400"}
              />
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
              src={session.user?.image ?? "/images/Perfil-sem-Foto-Fut7.png"}
              alt={session.user?.name ?? session.user?.email ?? "Administrador Fut7Pro"}
              width={38}
              height={38}
              className="rounded-full border-2 border-yellow-400"
            />
            <span className="text-yellow-300 font-bold text-base hidden md:inline">
              {session.user?.name ?? session.user?.email ?? "Admin"}
            </span>
            {dropdownOpen && (
              <div className="absolute top-12 right-0 bg-zinc-900 border border-zinc-800 rounded shadow-md w-44 py-2 z-50 flex flex-col">
                <Link
                  href="/admin/perfil"
                  className="flex items-center gap-2 px-4 py-2 text-base text-white hover:bg-zinc-800"
                  onClick={closeDropdown}
                >
                  <FaUser size={18} />
                  Meu Perfil
                </Link>
                <button
                  className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-zinc-800 text-base"
                  onClick={() => {
                    closeDropdown();
                    signOut({ callbackUrl: "/admin/login" });
                  }}
                >
                  <FaSignOutAlt size={18} />
                  Sair
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

