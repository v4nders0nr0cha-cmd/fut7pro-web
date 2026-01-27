"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaBell, FaEnvelope, FaUserPlus, FaUser } from "react-icons/fa";
import { useAdminBadges } from "@/hooks/useAdminBadges";
import { useSession } from "next-auth/react";
import type { IconType } from "react-icons";

type BadgeKey = "dashboard" | "notificacoes" | "mensagens" | "solicitacoes" | "perfil";

interface MenuItem {
  label: string;
  icon: IconType;
  href: string;
  badgeKey: BadgeKey;
}

const menu: MenuItem[] = [
  { label: "Dashboard", icon: FaHome, href: "/admin/dashboard", badgeKey: "dashboard" },
  { label: "Notificações", icon: FaBell, href: "/admin/notificacoes", badgeKey: "notificacoes" },
  { label: "Mensagens", icon: FaEnvelope, href: "/admin/mensagens", badgeKey: "mensagens" },
  {
    label: "Solicitações",
    icon: FaUserPlus,
    href: "/admin/jogadores/listar-cadastrar#solicitacoes",
    badgeKey: "solicitacoes",
  },
  { label: "Perfil", icon: FaUser, href: "/admin/perfil", badgeKey: "perfil" },
];

export default function BottomMenuAdmin() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { badges } = useAdminBadges();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  // SE NÃO LOGADO
  if (!isLoggedIn) {
    return (
      <nav className="fixed z-50 bottom-0 left-0 w-full bg-zinc-900 border-t border-zinc-800 flex justify-center items-center px-1 py-2 md:hidden animate-slide-down">
        <button
          type="button"
          onClick={() => router.push("/admin/login")}
          className="flex items-center gap-2 border border-brand bg-[#222] text-brand px-4 py-2 rounded-full font-bold text-[15px] uppercase shadow-md hover:bg-brand hover:text-black transition-all"
          style={{ letterSpacing: 1 }}
        >
          <FaUser size={20} className="text-brand" />
          Entrar ou Cadastrar-se
        </button>
      </nav>
    );
  }

  // SE LOGADO
  return (
    <nav className="fixed z-50 bottom-0 left-0 w-full bg-zinc-900 border-t border-zinc-800 flex justify-between items-center px-1 py-2 md:hidden animate-slide-down">
      {menu.map((item) => {
        const baseHref = item.href.split("#")[0];
        const isActive = pathname.startsWith(baseHref);
        const badgeValue = badges[item.badgeKey] ?? 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center text-xs relative group min-h-[56px]"
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
              <span className="absolute top-0 right-3 bg-red-600 text-white text-xs rounded-full px-1.5 font-bold">
                {badgeValue}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
