"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaBell, FaEnvelope, FaUserPlus, FaUser, FaSignOutAlt, FaBars } from "react-icons/fa";
import { useAdminBadges } from "@/hooks/useAdminBadges";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import { useMe } from "@/hooks/useMe";
import { buildPublicHref } from "@/utils/public-links";
import { useBranding } from "@/hooks/useBranding";
import useSWR from "swr";
import { setStoredTenantSlug } from "@/utils/active-tenant";
import AvatarFut7Pro from "@/components/ui/AvatarFut7Pro";
import { DEFAULT_ADMIN_AVATAR, getAvatarSrc } from "@/utils/avatar";

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
    href: "/admin/jogadores/listar-cadastrar#solicitacoes",
    badgeKey: "solicitacoes",
  },
];

type HeaderProps = {
  onMenuClick?: () => void;
};

type HubRacha = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  role: string;
};

const hubFetcher = async (url: string): Promise<HubRacha[]> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json().catch(() => null);
  return Array.isArray(data) ? data : [];
};

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { badges } = useAdminBadges();
  const { data: session } = useSession();
  const { me } = useMe({ context: "admin" });
  const { nome: rachaNome } = useBranding({ scope: "admin" });
  const { data: hubData } = useSWR<HubRacha[]>(
    session?.user ? "/api/admin/hub" : null,
    hubFetcher,
    { revalidateOnFocus: false }
  );
  const canSwitchRacha = Array.isArray(hubData) && hubData.length > 1;
  const isLoggedIn = !!session?.user;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const displayName = me?.athlete?.firstName || session?.user?.name || "Admin";
  const displayAvatar = getAvatarSrc(
    me?.athlete?.avatarUrl || session?.user?.image,
    DEFAULT_ADMIN_AVATAR
  );
  const tenantSlug = me?.tenant?.tenantSlug || (session?.user as any)?.tenantSlug || null;
  const rachaPerfilHref = tenantSlug ? buildPublicHref("/perfil", tenantSlug) : null;
  const athletePublicKey = me?.athlete?.slug || me?.athlete?.id || null;
  const publicProfileHref =
    tenantSlug && athletePublicKey
      ? buildPublicHref(`/atletas/${athletePublicKey}`, tenantSlug)
      : null;

  useEffect(() => {
    if (!tenantSlug) return;
    setStoredTenantSlug(tenantSlug);
  }, [tenantSlug]);

  return (
    <header className="w-full z-50 top-0 left-0 bg-zinc-900 border-b border-brand shadow-md flex items-center px-4 py-2 h-[56px] fixed">
      {/* MOBILE: Botão hamburguer */}
      <button
        onClick={onMenuClick}
        className="md:hidden flex items-center justify-center mr-2 text-brand hover:bg-zinc-800 p-2 rounded-full"
        aria-label="Abrir menu"
        tabIndex={0}
      >
        <FaBars size={24} />
      </button>

      {/* MARCA FIXA FUT7PRO (admin) */}
      <Link
        href="/admin/dashboard"
        className="flex items-center gap-2 select-none ml-1 md:ml-2"
        tabIndex={0}
      >
        <span className="text-white font-extrabold text-xl md:text-2xl tracking-tight leading-none">
          Fut
          <span className="text-brand animate-pulse drop-shadow">7</span>
          Pro
        </span>
        {rachaNome && rachaNome !== "Fut7Pro" ? (
          <span className="hidden md:inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-gray-300">
            {rachaNome}
          </span>
        ) : null}
      </Link>

      {/* AÇÕES ALINHADAS À DIREITA */}
      <div className="flex items-center gap-6 ml-auto">
        {menu.map((item) => {
          const baseHref = item.href.split("#")[0];
          const isActive = pathname.startsWith(baseHref);
          const badgeValue = badges[item.badgeKey] ?? 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-800 transition"
              tabIndex={0}
            >
              <item.icon size={20} className="text-brand" />
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
            className="flex items-center gap-2 border border-brand bg-[#222] text-brand px-4 py-1.5 rounded-full font-bold text-sm uppercase shadow-md hover:bg-brand hover:text-black transition-all"
            onClick={() => router.push("/admin/login")}
          >
            <FaUser size={16} className="text-brand" />
            Entrar ou Cadastrar-se
          </button>
        ) : (
          <div
            className="flex items-center gap-2 group relative cursor-pointer"
            onClick={() => setDropdownOpen((v) => !v)}
            tabIndex={0}
          >
            <AvatarFut7Pro
              src={displayAvatar}
              alt={displayName}
              width={38}
              height={38}
              fallbackSrc={DEFAULT_ADMIN_AVATAR}
              className="rounded-full border-2 border-brand"
            />
            <span className="text-brand-soft font-bold text-base hidden md:inline">
              {displayName}
            </span>
            {dropdownOpen && (
              <div className="absolute top-12 right-0 bg-zinc-900 border border-zinc-800 rounded shadow-md w-44 py-2 z-50 flex flex-col">
                <Link
                  href="/perfil"
                  className="flex items-center gap-2 px-4 py-2 text-white hover:bg-zinc-800 text-base"
                  onClick={() => {
                    if (tenantSlug) {
                      setStoredTenantSlug(tenantSlug);
                    }
                    setDropdownOpen(false);
                  }}
                >
                  Perfil Global Fut7Pro
                </Link>
                {rachaPerfilHref && (
                  <Link
                    href={rachaPerfilHref}
                    className="flex items-center gap-2 px-4 py-2 text-white hover:bg-zinc-800 text-base"
                    onClick={() => {
                      if (tenantSlug) {
                        setStoredTenantSlug(tenantSlug);
                      }
                      setDropdownOpen(false);
                    }}
                  >
                    Meu perfil neste racha
                  </Link>
                )}
                {canSwitchRacha && (
                  <Link
                    href="/perfil#meus-rachas"
                    className="flex items-center gap-2 px-4 py-2 text-white hover:bg-zinc-800 text-base"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Trocar de racha
                  </Link>
                )}
                {publicProfileHref && (
                  <Link
                    href={publicProfileHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-white hover:bg-zinc-800 text-base"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Ver perfil público
                  </Link>
                )}
                <button
                  className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-zinc-800 text-base"
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                >
                  <FaSignOutAlt size={18} />
                  Sair da conta
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
