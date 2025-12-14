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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#121212] border-b border-[#232323] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between min-h-[62px] relative">
        {/* Logo e nome */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-90 transition-all"
          aria-label={`Página inicial ${nome}`}
        >
          <Image
            src={logo}
            alt={`Logo ${nome} - sistema de futebol`}
            width={44}
            height={44}
            className="object-contain rounded"
            priority
          />
          <span className="text-2xl font-bold text-yellow-400 truncate max-w-[140px] md:max-w-none">
            {nome}
          </span>
        </Link>

        {/* QuickMenu - desktop only */}
        <div className="hidden md:flex items-center gap-4">
          {quickMenu.map((item) => {
            let badgeValue = 0;
            if (item.label === "Comunicação" && badge > 0) badgeValue = badge;
            if (item.label === "Mensagens" && badgeMensagem > 0) badgeValue = badgeMensagem;
            if (item.label === "Sugestões" && badgeSugestoes > 0) badgeValue = badgeSugestoes;

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
                className="relative flex items-center gap-2 group px-2 py-1 rounded-lg transition"
                aria-label={item.label}
                onClick={handleClick}
              >
                <item.icon size={22} className="text-yellow-400 drop-shadow" />
                <span className="text-[15px] font-semibold text-white">{item.label}</span>
                {badgeValue > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 min-w-[18px] h-5 flex items-center justify-center shadow-lg border-2 border-[#121212] font-bold">
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
              className="ml-2 flex items-center gap-2 border border-yellow-400 bg-[#222] text-yellow-400 px-3 py-1 rounded-full font-bold text-[14px] uppercase shadow-md hover:bg-yellow-400 hover:text-black transition-all"
              style={{ letterSpacing: 1 }}
            >
              <FaUser size={18} className="text-yellow-400" />
              ENTRAR OU CADASTRE-SE
            </Link>
          ) : (
            <div className="flex items-center gap-3 ml-3">
              <Link href="/perfil" className="flex items-center gap-2 hover:opacity-80 transition">
                <Image
                  src={profileImage}
                  alt={session.user?.name || "Usuário"}
                  width={32}
                  height={32}
                  className="rounded-full border-2 border-yellow-400"
                />
                <span className="text-yellow-400 font-bold text-[15px] uppercase truncate max-w-[90px]">
                  {session.user?.name}
                </span>
              </Link>
              <button
                onClick={() => signOut()}
                className="text-xs text-gray-400 hover:text-red-500 transition font-semibold uppercase"
              >
                SAIR
              </button>
            </div>
          )}
        </div>
        {/* Botão Mobile */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={onOpenSidebar}
          aria-label="Abrir menu"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* Sombra dourada na base do header */}
        <div
          className="absolute left-0 right-0 -bottom-2 h-[6px] pointer-events-none z-50"
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
