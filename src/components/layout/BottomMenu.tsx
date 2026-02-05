"use client";
import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaBell, FaUser, FaCommentDots, FaLightbulb } from "react-icons/fa";
import { useComunicacao } from "@/hooks/useComunicacao";
import { useMe } from "@/hooks/useMe";
import { useSession } from "next-auth/react";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { resolvePublicTenantSlug } from "@/utils/public-links";

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
  const { data: session } = useSession();
  const slugFromPath = resolvePublicTenantSlug(pathname);
  const { publicHref } = usePublicLinks();
  const tenantSlug = slugFromPath || "";
  const sessionRole = String((session?.user as any)?.role || "").toUpperCase();
  const isAthleteSession = sessionRole === "ATLETA" || sessionRole === "ATHLETE";
  const shouldCheckMe = Boolean(session?.user && tenantSlug && isAthleteSession);
  const { me } = useMe({
    enabled: shouldCheckMe,
    tenantSlug,
    context: "athlete",
  });
  const isLoggedIn = Boolean(me?.athlete?.id);
  const { badge, badgeMensagem, badgeSugestoes } = useComunicacao({ enabled: isLoggedIn });

  if (!tenantSlug) {
    return null;
  }

  function handleClick(href: string, label: string) {
    if (label === "Perfil" && !isLoggedIn) {
      router.push(publicHref("/login"));
    } else {
      router.push(publicHref(href));
    }
  }

  // SE NÃO LOGADO: mostra botão entrar/cadastrar-se
  if (!isLoggedIn) {
    return (
      <nav className="fixed z-50 bottom-0 left-0 w-full bg-zinc-900 border-t border-zinc-800 flex justify-center items-center px-1 py-2 md:hidden animate-slide-down">
        <button
          type="button"
          onClick={() => router.push(publicHref("/login"))}
          className="flex items-center gap-2 border border-brand bg-[#222] text-brand px-4 py-2 rounded-full font-bold text-[15px] uppercase shadow-md hover:bg-brand hover:text-black transition-all"
          style={{ letterSpacing: 1 }}
          title="Area do atleta"
          aria-label="Entrar - area do atleta"
        >
          <FaUser size={20} className="text-brand" />
          Entrar
        </button>
      </nav>
    );
  }

  // SE LOGADO: mostra menu completo
  return (
    <nav className="fixed z-50 bottom-0 left-0 w-full bg-zinc-900 border-t border-zinc-800 flex justify-between items-center px-1 py-2 md:hidden animate-slide-down">
      {menu.map((item) => {
        const resolvedHref = publicHref(item.href);
        const isActive =
          item.href === "/"
            ? pathname === "/" || pathname === resolvedHref
            : pathname.startsWith(resolvedHref) || pathname.startsWith(item.href);

        let badgeValue = 0;
        if (item.label === "Comunicação" && badge > 0) badgeValue = badge;
        if (item.label === "Mensagens" && badgeMensagem > 0) badgeValue = badgeMensagem;
        if (item.label === "Sugestões" && badgeSugestoes > 0) badgeValue = badgeSugestoes;

        return (
          <button
            key={item.href}
            type="button"
            onClick={() => handleClick(item.href, item.label)}
            className="flex-1 flex flex-col items-center justify-center text-xs relative group bg-transparent border-none outline-none"
            aria-label={item.label}
          >
            <item.icon
              size={24}
              className={`mb-0.5 transition ${isActive ? "text-brand" : "text-zinc-300 group-hover:text-brand-soft"}`}
            />
            <span
              className={`${isActive ? "text-brand font-semibold" : "text-zinc-300"} group-hover:text-brand-soft`}
            >
              {item.label}
            </span>
            {badgeValue > 0 && (
              <span className="absolute top-0 right-4 bg-red-600 text-white text-xs rounded-full px-1.5 font-bold">
                {badgeValue}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
