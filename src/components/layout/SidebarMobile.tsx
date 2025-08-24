"use client";

import type { FC } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  FaHome,
  FaChartBar,
  FaTrophy,
  FaFutbol,
  FaUsers,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";
import Image from "next/image";
import { useTema } from "@/hooks/useTema";
import { usePathname } from "next/navigation";
import { rachaConfig } from "@/config/racha.config";

type SidebarMobileProps = {
  open: boolean;
  onClose: () => void;
};

const SidebarMobile: FC<SidebarMobileProps> = ({ open, onClose }) => {
  const { data: session } = useSession();
  const { logo, nome } = useTema();
  const pathname = usePathname() ?? "";
  const isLoggedIn = !!session?.user;
  const profileImage = session?.user?.image || "/images/jogadores/default.png";
  const userName = session?.user?.name || "Usuário";

  if (!open) return null;

  const links = [
    { href: "/", label: "Início", icon: FaHome },
    { href: "/partidas", label: "Partidas", icon: FaFutbol },
    { href: "/estatisticas", label: "Estatísticas", icon: FaChartBar },
    { href: "/os-campeoes", label: "Os Campeões", icon: FaTrophy },
    { href: "/grandes-torneios", label: "Grandes Torneios", icon: FaTrophy },
    { href: "/atletas", label: "Perfis dos Atletas", icon: FaUsers },
    { href: "/sobre-nos", label: "Sobre Nós", icon: FaInfoCircle },
  ];

  return (
    <div className="fixed inset-0 z-50 flex bg-black/70 md:hidden">
      <div className="relative flex h-full w-72 animate-slide-in-left flex-col bg-zinc-900 px-5 py-8 shadow-xl">
        {/* Botão Fechar */}
        <button
          aria-label="Fechar menu"
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl text-zinc-300 hover:text-white"
        >
          <FaTimes />
        </button>

        {/* Logo e nome do racha */}
        <div className="mb-10 mt-4 flex flex-col items-center gap-2">
          <Image
            src={logo}
            alt={`Logo ${rachaConfig.nome}`}
            width={64}
            height={64}
            className="object-contain"
          />
          <span className="text-center text-xl font-extrabold text-yellow-400">
            {nome}
          </span>
        </div>

        {/* Navegação */}
        <nav className="flex flex-col gap-4 text-[17px]">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-4 rounded px-2 py-2 transition-all duration-200 ${
                  isActive
                    ? "scale-[1.02] font-extrabold text-yellow-400"
                    : "text-zinc-200 hover:text-yellow-300"
                }`}
              >
                <Icon size={22} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Perfil + SAIR */}
        {isLoggedIn && (
          <div className="mt-10 border-t border-zinc-700 pt-4">
            <Link
              href="/perfil"
              onClick={onClose}
              className="flex items-center gap-3 font-semibold text-yellow-400 hover:underline"
            >
              <Image
                src={profileImage}
                alt={userName}
                width={32}
                height={32}
                className="rounded-full"
              />
              {userName}
            </Link>

            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="mt-3 text-sm font-bold text-red-500 hover:text-red-400"
            >
              Sair
            </button>
          </div>
        )}
      </div>

      {/* Clicando fora, fecha o menu */}
      <div
        className="flex-1"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Fechar menu"
      />
    </div>
  );
};

export default SidebarMobile;
