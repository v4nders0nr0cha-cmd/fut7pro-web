"use client";

import type { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaBell, FaUser, FaCommentDots, FaLightbulb } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import { useTema } from "@/hooks/useTema";
import { useComunicacao } from "@/hooks/useComunicacao";
import { useNotificationBadge } from "@/hooks/useNotificationBadge";
import { useRacha } from "@/context/RachaContext";
import { rachaConfig } from "@/config/racha.config";

type HeaderProps = {
  onOpenSidebar?: () => void;
};

const quickMenu = [
  { label: "Sugestões", icon: FaLightbulb, href: "/comunicacao/sugestoes" },
  { label: "Comunicação", icon: FaBell, href: "/comunicacao/notificacoes" },
  { label: "Mensagens", icon: FaCommentDots, href: "/comunicacao/mensagens" },
];

const Header: FC<HeaderProps> = ({ onOpenSidebar }) => {
  const { logo, nome } = useTema();
  const { data: session } = useSession();
  const router = useRouter();
  const isLoggedIn = !!session?.user;
  const profileImage = session?.user?.image || "/images/jogadores/default.png";
  const { badge, badgeMensagem, badgeSugestoes } = useComunicacao();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#232323] bg-[#121212] shadow-sm">
      <div className="relative mx-auto flex min-h-[62px] max-w-7xl items-center justify-between px-4 py-2">
        {/* Logo e nome */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-all hover:opacity-90"
          aria-label={`Página inicial ${rachaConfig.nome}`}
        >
          <Image
            src={logo}
            alt={`Logo ${rachaConfig.nome} - sistema de futebol`}
            width={44}
            height={44}
            className="rounded object-contain"
            priority
          />
          <span className="max-w-[140px] truncate text-2xl font-bold text-yellow-400 md:max-w-none">
            {nome}
          </span>
        </Link>

        {/* QuickMenu - desktop only */}
        <div className="hidden items-center gap-4 md:flex">
          {quickMenu.map((item) => {
            let badgeValue = 0;
            if (item.label === "Comunicação" && badge > 0) badgeValue = badge;
            if (item.label === "Mensagens" && badgeMensagem > 0)
              badgeValue = badgeMensagem;
            if (item.label === "Sugestões" && badgeSugestoes > 0)
              badgeValue = badgeSugestoes;

            // Novo: se não logado, bloqueia navegação e manda para login
            const handleClick = (e: React.MouseEvent) => {
              if (!isLoggedIn) {
                e.preventDefault();
                router.push("/login");
              }
            };

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex items-center gap-2 rounded-lg px-2 py-1 transition"
                aria-label={item.label}
                onClick={handleClick}
              >
                <item.icon size={22} className="text-yellow-400 drop-shadow" />
                <span className="text-[15px] font-semibold text-white">
                  {item.label}
                </span>
                {badgeValue > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-[18px] items-center justify-center rounded-full border-2 border-[#121212] bg-red-600 px-1.5 text-xs font-bold text-white shadow-lg">
                    {badgeValue}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Perfil/Login - à direita dos ícones */}
          {!isLoggedIn ? (
            <Link
              href="/login"
              className="ml-2 flex items-center gap-2 rounded-full border border-yellow-400 bg-[#222] px-3 py-1 text-[14px] font-bold uppercase text-yellow-400 shadow-md transition-all hover:bg-yellow-400 hover:text-black"
              style={{ letterSpacing: 1 }}
            >
              <FaUser size={18} className="text-yellow-400" />
              ENTRAR OU CADASTRE-SE
            </Link>
          ) : (
            <div className="ml-3 flex items-center gap-3">
              <Link
                href="/perfil"
                className="flex items-center gap-2 transition hover:opacity-80"
              >
                <Image
                  src={profileImage}
                  alt={session.user?.name || "Usuário"}
                  width={32}
                  height={32}
                  className="rounded-full border-2 border-yellow-400"
                />
                <span className="max-w-[90px] truncate text-[15px] font-bold uppercase text-yellow-400">
                  {session.user?.name}
                </span>
              </Link>
              <button
                onClick={() => signOut()}
                className="text-xs font-semibold uppercase text-gray-400 transition hover:text-red-500"
              >
                SAIR
              </button>
            </div>
          )}
        </div>
        {/* Botão Mobile */}
        <button
          className="text-white focus:outline-none md:hidden"
          onClick={onOpenSidebar}
          aria-label="Abrir menu"
        >
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        {/* Sombra dourada na base do header */}
        <div
          className="pointer-events-none absolute -bottom-2 left-0 right-0 z-50 h-[6px]"
          style={{
            background:
              "radial-gradient(ellipse at center, #FFD700 0%, rgba(255,215,0,0.08) 70%, rgba(18,18,18,0.7) 100%)",
            opacity: 0.55,
            boxShadow: "0 3px 16px 0 #FFD70088, 0 1px 0 0 #FFD70044",
          }}
        />
      </div>
    </header>
  );
};

export default Header;
