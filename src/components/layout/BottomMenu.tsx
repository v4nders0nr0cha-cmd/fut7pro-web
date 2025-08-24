"use client";
import { usePathname, useRouter } from "next/navigation";
import {
  FaHome,
  FaBell,
  FaUser,
  FaCommentDots,
  FaLightbulb,
} from "react-icons/fa";
import { useComunicacao } from "@/hooks/useComunicacao";
import { useSession } from "next-auth/react";

const menu = [
  { label: "Início", icon: FaHome, href: "/" },
  { label: "Sugestões", icon: FaLightbulb, href: "/comunicacao/sugestoes" },
  { label: "Comunicação", icon: FaBell, href: "/comunicacao/notificacoes" },
  { label: "Mensagens", icon: FaCommentDots, href: "/comunicacao/mensagens" },
  { label: "Perfil", icon: FaUser, href: "/perfil" },
];

export default function BottomMenu() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { badge, badgeMensagem, badgeSugestoes } = useComunicacao();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  function handleClick(href: string, label: string) {
    if (label === "Perfil" && !isLoggedIn) {
      router.push("/login");
    } else {
      router.push(href);
    }
  }

  // SE NÃO LOGADO: mostra botão entrar/cadastrar-se
  if (!isLoggedIn) {
    return (
      <nav className="fixed bottom-0 left-0 z-50 flex w-full animate-slide-down items-center justify-center border-t border-zinc-800 bg-zinc-900 px-1 py-2 md:hidden">
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="flex items-center gap-2 rounded-full border border-yellow-400 bg-[#222] px-4 py-2 text-[15px] font-bold uppercase text-yellow-400 shadow-md transition-all hover:bg-yellow-400 hover:text-black"
          style={{ letterSpacing: 1 }}
        >
          <FaUser size={20} className="text-yellow-400" />
          Entrar ou Cadastrar-se
        </button>
      </nav>
    );
  }

  // SE LOGADO: mostra menu completo
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full animate-slide-down items-center justify-between border-t border-zinc-800 bg-zinc-900 px-1 py-2 md:hidden">
      {menu.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        let badgeValue = 0;
        if (item.label === "Comunicação" && badge > 0) badgeValue = badge;
        if (item.label === "Mensagens" && badgeMensagem > 0)
          badgeValue = badgeMensagem;
        if (item.label === "Sugestões" && badgeSugestoes > 0)
          badgeValue = badgeSugestoes;

        return (
          <button
            key={item.href}
            type="button"
            onClick={() => handleClick(item.href, item.label)}
            className="group relative flex flex-1 flex-col items-center justify-center border-none bg-transparent text-xs outline-none"
            aria-label={item.label}
          >
            <item.icon
              size={24}
              className={`mb-0.5 transition ${isActive ? "text-yellow-400" : "text-zinc-300 group-hover:text-yellow-300"}`}
            />
            <span
              className={`${isActive ? "font-semibold text-yellow-400" : "text-zinc-300"} group-hover:text-yellow-300`}
            >
              {item.label}
            </span>
            {badgeValue > 0 && (
              <span className="absolute right-4 top-0 rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">
                {badgeValue}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
