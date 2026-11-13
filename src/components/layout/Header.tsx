"use client";

import { useEffect, useState, type FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaBell, FaUser, FaCommentDots, FaLightbulb } from "react-icons/fa";
import { signOut } from "next-auth/react";
import { useTema } from "@/hooks/useTema";
import { useComunicacao } from "@/hooks/useComunicacao";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { resolveActiveTenantSlug, setStoredTenantSlug } from "@/utils/active-tenant";
import { resolvePublicTenantSlug } from "@/utils/public-links";
import { usePublicPersonalArea } from "@/hooks/usePublicPersonalArea";
import { DEFAULT_ATHLETE_AVATAR } from "@/utils/avatar";
import { FaExchangeAlt, FaChartLine, FaPen, FaClock, FaSignOutAlt } from "react-icons/fa";
import { useRef } from "react";
import AvatarFut7Pro from "@/components/ui/AvatarFut7Pro";

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
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const slugFromPath = resolvePublicTenantSlug(pathname);
  const activeSlug = resolveActiveTenantSlug(pathname);
  const { publicHref } = usePublicLinks();
  const tenantSlug = activeSlug || "";
  const personal = usePublicPersonalArea(tenantSlug);
  const showUserMenu = personal.authenticated;
  const hasApprovedTenantProfile = personal.approved;
  const displayName = personal.name;
  const profileImage = personal.avatar;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const { badge, badgeMensagem, badgeSugestoes } = useComunicacao({
    enabled: hasApprovedTenantProfile,
  });
  const homeHref = publicHref("/");
  const loginHref = publicHref("/entrar");
  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") {
          setDropdownOpen(false);
          accountButtonRef.current?.focus();
        }
      } else if (!dropdownRef.current?.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    if (!slugFromPath) return;
    setStoredTenantSlug(slugFromPath);
  }, [slugFromPath]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#121212] border-b border-[#232323] shadow-sm">
      <div className="relative mx-auto flex min-h-[62px] max-w-7xl items-center gap-1 px-2.5 py-2 sm:px-4">
        {/* Logo e nome */}
        <Link
          href={homeHref}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md pr-1 transition-all hover:opacity-90 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]"
          aria-label={`Página inicial ${nome}`}
        >
          <Image
            src={logo}
            alt={`Logo ${nome} - sistema de futebol`}
            width={44}
            height={44}
            className="h-9 w-9 shrink-0 rounded object-contain sm:h-10 sm:w-10 md:h-11 md:w-11"
            priority
          />
          <span
            className="min-w-0 flex-1 truncate whitespace-nowrap text-lg font-bold leading-tight text-brand sm:text-xl md:text-2xl"
            title={nome}
          >
            {nome}
          </span>
        </Link>

        {/* QuickMenu - desktop only */}
        <div
          className={`items-center gap-4 lg:flex ${showUserMenu && !tenantSlug ? "flex" : "hidden"}`}
        >
          {quickMenu.map((item) => {
            let badgeValue = 0;
            if (item.label === "Comunicação" && badge > 0) badgeValue = badge;
            if (item.label === "Mensagens" && badgeMensagem > 0) badgeValue = badgeMensagem;
            if (item.label === "Sugestões" && badgeSugestoes > 0) badgeValue = badgeSugestoes;

            // Se não logado, permite navegação mas direciona para fluxo de entrada do racha.
            const handleClick = (e: React.MouseEvent) => {
              if (!hasApprovedTenantProfile) {
                e.preventDefault();
                router.push(loginHref);
              }
            };

            return (
              <Link
                key={item.href}
                href={publicHref(item.href)}
                className="group relative hidden min-h-[44px] items-center gap-2 rounded-lg px-2 py-2 transition lg:flex"
                aria-label={item.label}
                onClick={handleClick}
              >
                <item.icon size={22} className="text-brand drop-shadow" />
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
          {!showUserMenu ? (
            <Link
              href={loginHref}
              className="ml-2 flex items-center gap-2 border border-brand bg-[#222] text-brand px-3 py-1.5 rounded-full shadow-md hover:bg-brand hover:text-black transition-all"
              style={{ letterSpacing: 1 }}
            >
              <FaUser size={18} className="text-brand shrink-0" />
              <span className="flex flex-col leading-tight text-left">
                <span className="text-[13px] font-bold uppercase">Entrar</span>
                <span className="text-[10px] font-semibold text-brand-soft normal-case truncate max-w-[140px]">
                  Área dos Atletas
                </span>
              </span>
            </Link>
          ) : (
            <div ref={dropdownRef} className="relative ml-3 flex items-center gap-3">
              <button
                ref={accountButtonRef}
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
                aria-label="Abrir área pessoal"
                className="flex items-center gap-2 hover:opacity-80 transition"
              >
                <AvatarFut7Pro
                  src={profileImage}
                  alt={displayName}
                  width={32}
                  height={32}
                  fallbackSrc={DEFAULT_ATHLETE_AVATAR}
                  className="rounded-full border-2 border-brand"
                />
                <span className="hidden max-w-[90px] truncate text-[15px] font-bold uppercase text-brand lg:block">
                  {displayName}
                </span>
              </button>

              {dropdownOpen && (
                <div
                  role="menu"
                  aria-label="Área pessoal"
                  className="absolute right-0 top-12 z-50 max-h-[min(75vh,36rem)] w-[min(22rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl border border-white/15 bg-[#17191e] p-3 shadow-2xl"
                >
                  <div className="flex min-w-0 items-center gap-3 border-b border-white/10 px-2 pb-3">
                    <AvatarFut7Pro
                      src={profileImage}
                      alt={displayName}
                      width={44}
                      height={44}
                      fallbackSrc={DEFAULT_ATHLETE_AVATAR}
                      className="shrink-0 rounded-full border border-brand"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white" title={displayName}>
                        {displayName}
                      </p>
                      <p className="truncate text-xs text-zinc-400" title={personal.email}>
                        {personal.email}
                      </p>
                    </div>
                  </div>
                  {personal.sections.map((section) => (
                    <section key={section.title} className="border-b border-white/10 py-2">
                      <h2 className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-brand">
                        {section.title}
                      </h2>
                      {section.items.map((item) => {
                        const icons = {
                          account: FaUser,
                          edit: FaPen,
                          performance: FaChartLine,
                          switch: FaExchangeAlt,
                          pending: FaClock,
                        };
                        const Icon = icons[item.icon as keyof typeof icons];
                        return (
                          <Link
                            key={item.label}
                            role="menuitem"
                            href={item.href}
                            onClick={() => setDropdownOpen(false)}
                            className="flex min-h-10 items-center gap-3 rounded-lg px-2 py-2 text-sm text-zinc-100 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                          >
                            <Icon className="text-brand" aria-hidden="true" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </section>
                  ))}
                  {personal.groupSlug && (
                    <Link
                      role="menuitem"
                      href={`/${personal.groupSlug}/minha-conta`}
                      onClick={() => setDropdownOpen(false)}
                      className="mt-2 block rounded-lg px-2 py-2 text-sm text-brand hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      Ver área pessoal
                    </Link>
                  )}
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      void signOut({ callbackUrl: homeHref });
                    }}
                    className="mt-1 flex min-h-10 w-full items-center gap-3 rounded-lg px-2 text-left text-sm text-red-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <FaSignOutAlt aria-hidden="true" />
                    Sair da conta
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Botão Mobile */}
        <button
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Abrir menu"
        >
          <svg
            className="h-6 w-6"
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
              "radial-gradient(ellipse at center, var(--brand) 0%, transparent 70%, rgba(18,18,18,0.7) 100%)",
            opacity: 0.55,
            boxShadow: "0 3px 16px 0 var(--brand), 0 1px 0 0 var(--brand)",
          }}
        />
      </div>
    </header>
  );
};

export default Header;
