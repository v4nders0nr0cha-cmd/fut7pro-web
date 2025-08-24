"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaBell, FaEnvelope, FaUserPlus, FaUser } from "react-icons/fa";
import { useAdminBadges } from "@/hooks/useAdminBadges";
import { useSession } from "next-auth/react";
import type { IconType } from "react-icons";

type BadgeKey =
  | "dashboard"
  | "notificacoes"
  | "mensagens"
  | "solicitacoes"
  | "perfil";

interface MenuItem {
  label: string;
  icon: IconType;
  href: string;
  badgeKey: BadgeKey;
}

const menu: MenuItem[] = [
  {
    label: "Dashboard",
    icon: FaHome,
    href: "/admin/dashboard",
    badgeKey: "dashboard",
  },
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
      <nav className="fixed bottom-0 left-0 z-50 flex w-full animate-slide-down items-center justify-center border-t border-zinc-800 bg-zinc-900 px-1 py-2 md:hidden">
        <button
          type="button"
          onClick={() => router.push("/admin/login")}
          className="flex items-center gap-2 rounded-full border border-yellow-400 bg-[#222] px-4 py-2 text-[15px] font-bold uppercase text-yellow-400 shadow-md transition-all hover:bg-yellow-400 hover:text-black"
          style={{ letterSpacing: 1 }}
        >
          <FaUser size={20} className="text-yellow-400" />
          Entrar ou Cadastrar-se
        </button>
      </nav>
    );
  }

  // SE LOGADO
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full animate-slide-down items-center justify-between border-t border-zinc-800 bg-zinc-900 px-1 py-2 md:hidden">
      {menu.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const badgeValue = badges[item.badgeKey] ?? 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="group relative flex min-h-[56px] flex-1 flex-col items-center justify-center text-xs"
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
              <span className="absolute right-3 top-0 rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">
                {badgeValue}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
