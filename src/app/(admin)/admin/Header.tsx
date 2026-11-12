"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaBell, FaEnvelope, FaUserPlus, FaUser, FaBars } from "react-icons/fa";
import { useAdminBadges } from "@/hooks/useAdminBadges";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { useMe } from "@/hooks/useMe";
import { useBranding } from "@/hooks/useBranding";
import useSWR from "swr";
import { setStoredTenantSlug } from "@/utils/active-tenant";
import AvatarFut7Pro from "@/components/ui/AvatarFut7Pro";
import { DEFAULT_ADMIN_AVATAR, getAvatarSrc } from "@/utils/avatar";
import { useRacha } from "@/context/RachaContext";
import { getAdminProfileSections } from "./adminProfileNavigation";
import { LogOut } from "lucide-react";

type BadgeKey = "notificacoes" | "mensagens" | "solicitacoes";

interface MenuItem {
  label: string;
  icon: IconType;
  href: string;
  badgeKey: BadgeKey;
}

const menu: MenuItem[] = [
  {
    label: "Notificações",
    icon: FaBell,
    href: "/admin/comunicacao/notificacoes",
    badgeKey: "notificacoes",
  },
  {
    label: "Mensagens",
    icon: FaEnvelope,
    href: "/admin/comunicacao/mensagens",
    badgeKey: "mensagens",
  },
  {
    label: "Solicitações",
    icon: FaUserPlus,
    href: "/admin/solicitacoes",
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

function slugifyTestId(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { badges } = useAdminBadges();
  const { data: session } = useSession();
  const { me } = useMe({ context: "admin" });
  const { tenantSlug: contextTenantSlug } = useRacha();
  const { nome: rachaNome } = useBranding({ scope: "admin" });
  const { data: hubData } = useSWR<HubRacha[]>(
    session?.user ? "/api/admin/hub" : null,
    hubFetcher,
    { revalidateOnFocus: false }
  );
  const canSwitchRacha = Array.isArray(hubData) && hubData.length > 1;
  const isLoggedIn = !!session?.user;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLElement>(null);
  const displayName =
    session?.user?.name?.trim() ||
    me?.athlete?.firstName?.trim() ||
    session?.user?.email?.split("@")[0] ||
    "Admin";
  const displayAvatar = getAvatarSrc(
    session?.user?.image || me?.user?.avatarUrl || me?.athlete?.avatarUrl,
    DEFAULT_ADMIN_AVATAR
  );
  const tenantSlug = contextTenantSlug || me?.tenant?.tenantSlug || null;
  const athletePublicKey = me?.athlete?.slug || me?.athlete?.id || null;
  const profileSections = getAdminProfileSections({
    tenantSlug,
    athleteKey: athletePublicKey,
    canSwitchGroup: canSwitchRacha,
  });

  useEffect(() => {
    if (!tenantSlug) return;
    setStoredTenantSlug(tenantSlug);
  }, [tenantSlug]);

  useEffect(() => {
    if (!dropdownOpen) return;
    profileMenuRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [dropdownOpen]);

  return (
    <header className="w-full z-50 top-0 left-0 bg-zinc-900 border-b border-brand shadow-md flex items-center px-4 py-2 h-[56px] fixed">
      {/* MOBILE: Botão hamburguer */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center mr-2 text-brand hover:bg-zinc-800 p-2 rounded-full"
        aria-label="Abrir menu"
        tabIndex={0}
        data-testid="admin-header-open-menu"
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
          <span className="hidden lg:inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-gray-300">
            {rachaNome}
          </span>
        ) : null}
      </Link>

      {/* AÇÕES ALINHADAS À DIREITA */}
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 ml-auto">
        {menu.map((item) => {
          const baseHref = item.href.split("#")[0];
          const isActive = pathname.startsWith(baseHref);
          const badgeValue = badges[item.badgeKey] ?? 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={`relative hidden items-center gap-2 rounded px-2 py-1 transition hover:bg-zinc-800 sm:flex ${isActive ? "bg-zinc-800 text-brand" : ""}`}
              aria-current={isActive ? "page" : undefined}
              tabIndex={0}
              data-testid={`admin-header-link-${slugifyTestId(item.href)}`}
            >
              <item.icon size={20} className="text-brand" />
              <span className="text-white text-sm font-medium hidden lg:inline">{item.label}</span>
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
          <>
            <Link
              href="/admin/mais"
              className="flex items-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300 lg:hidden"
              aria-label="Abrir Mais"
            >
              <AvatarFut7Pro
                src={displayAvatar}
                alt=""
                width={38}
                height={38}
                fallbackSrc={DEFAULT_ADMIN_AVATAR}
                className="rounded-full border-2 border-brand"
              />
            </Link>
            <div
              ref={profileRef}
              className="relative hidden lg:block"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                  setDropdownOpen(false);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape" && dropdownOpen) {
                  event.preventDefault();
                  setDropdownOpen(false);
                  profileButtonRef.current?.focus();
                }
              }}
            >
              <button
                ref={profileButtonRef}
                type="button"
                className="flex items-center gap-2 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
                aria-label={`${dropdownOpen ? "Fechar" : "Abrir"} menu do perfil de ${displayName}`}
                aria-haspopup="true"
                aria-controls="admin-profile-menu"
                aria-expanded={dropdownOpen}
                onClick={() => setDropdownOpen((open) => !open)}
              >
                <AvatarFut7Pro
                  src={displayAvatar}
                  alt={displayName}
                  width={38}
                  height={38}
                  fallbackSrc={DEFAULT_ADMIN_AVATAR}
                  className="rounded-full border-2 border-brand"
                />
                <span className="hidden max-w-32 truncate text-base font-bold text-brand-soft xl:inline">
                  {displayName}
                </span>
              </button>
              {dropdownOpen && (
                <nav
                  ref={profileMenuRef}
                  id="admin-profile-menu"
                  aria-label="Menu do perfil"
                  className="absolute right-0 top-12 z-50 flex max-h-[calc(100dvh-72px)] w-80 max-w-[calc(100vw-24px)] flex-col overflow-y-auto rounded-xl border border-white/15 bg-[#1b1d22] py-2 shadow-2xl"
                >
                  <div className="flex items-center gap-3 border-b border-white/10 px-4 pb-3 pt-2">
                    <AvatarFut7Pro
                      src={displayAvatar}
                      alt=""
                      width={42}
                      height={42}
                      fallbackSrc={DEFAULT_ADMIN_AVATAR}
                      className="shrink-0 rounded-full border border-brand"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white" title={displayName}>
                        {displayName}
                      </p>
                      <p
                        className="truncate text-xs text-zinc-400"
                        title={session?.user?.email || undefined}
                      >
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                  {profileSections.map((section) => (
                    <div
                      key={section.id}
                      className="border-b border-white/10 px-2 py-2 last:border-0"
                    >
                      <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-soft">
                        {section.title}
                      </p>
                      {section.items.map((item) => {
                        const active =
                          pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            target={"external" in item && item.external ? "_blank" : undefined}
                            rel={
                              "external" in item && item.external
                                ? "noopener noreferrer"
                                : undefined
                            }
                            aria-current={active ? "page" : undefined}
                            className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-100 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300 ${active ? "bg-white/10 text-yellow-300" : ""}`}
                            onClick={() => {
                              if (
                                (item.id === "global-profile" || item.id === "group-profile") &&
                                tenantSlug
                              ) {
                                setStoredTenantSlug(tenantSlug);
                              }
                              setDropdownOpen(false);
                            }}
                          >
                            <item.icon
                              size={18}
                              aria-hidden="true"
                              className="shrink-0 text-yellow-300"
                            />
                            <span className="min-w-0 flex-1">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="mx-2 flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
                    onClick={() => signOut({ callbackUrl: "/admin/login" })}
                  >
                    <LogOut size={18} aria-hidden="true" />
                    Sair da conta
                  </button>
                </nav>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
